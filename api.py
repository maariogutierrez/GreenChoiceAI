"""
This FastAPI application receives a question and (optionally) multiple-choice answers.
It computes a heuristic difficulty score, predicts a category using an SVM classifier,
and selects the most cost-efficient model that meets a minimum accuracy threshold based
on stored performance data. The selected LLM is queried and returns only the final answer.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import textstat 
from difflib import SequenceMatcher
import pandas as pd
from sentence_transformers import SentenceTransformer
import joblib
from openai import OpenAI
import requests
import json
from pydantic import BaseModel

with open('CONFIG.json', "r", encoding="utf-8") as f:
    CONFIG = json.load(f) or {}

def difficulty_label(s: float) -> str:
    """Return a textual difficulty label based on a numeric score."""
    if s < 0.3:
        return "Very low"
    elif s < 0.45:
        return "Low"
    elif s < 0.6:
        return "Medium"
    elif s < 0.8:
        return "High"
    else:
        return "Very high"
    

def heuristic_difficulty(question_text: str, options: Optional[List[str]]) -> float:
    """Compute a heuristic difficulty score based on question length, reading complexity,
    and option similarity (text or numeric). If no answers are provided, difficulty is based
    only on 40% length and 60% readability."""

    length_ratio = min(len(question_text) / 100, 1)
    readability_score = min(textstat.flesch_reading_ease(question_text) / 100, 1)

    # Case: No answer options provided
    if not options:
        return (0.4 * length_ratio) + (0.6 * (1 - readability_score))

    similarities = []

    def is_pure_number(text: str) -> bool:
        """Check if a value is a pure number (not a range or formatted)."""
        try:
            cleaned = str(text).strip()
            if '-' in cleaned[1:]:
                return False
            float(cleaned)
            return True
        except:
            return False

    numeric_options = all(is_pure_number(op) for op in options)

    if numeric_options:
        values = [float(op) for op in options]
        for i in range(len(values)):
            for j in range(i + 1, len(values)):
                max_val = max(abs(values[i]), abs(values[j]))
                if max_val == 0:
                    numeric_similarity = 1.0
                else:
                    diff = abs(values[i] - values[j]) / max_val
                    numeric_similarity = 1 - min(diff, 1)
                similarities.append(numeric_similarity)
    else:
        for i in range(len(options)):
            for j in range(i + 1, len(options)):
                ratio = SequenceMatcher(None, str(options[i]).lower(), str(options[j]).lower()).ratio()
                similarities.append(ratio)

    similarity = sum(similarities) / len(similarities) if similarities else 0

    return (0.2 * length_ratio) + (0.4 * (1 - readability_score)) + (0.4 * similarity)

embedder = SentenceTransformer('embedder')
clf = joblib.load('clasificador_svm.pkl')

def get_category(input: str) -> str:
    """Encode input question and classify it using a trained SVM model."""
    emb = embedder.encode([input])
    pred = clf.predict(emb)[0]
    return pred

performance = pd.read_csv('tasa_aciertos.csv')
models = ['o4-mini', 'GPT-4o-mini', 'Llama-3.1-8B']

THRESHOLD = 0.52

def route_question(category: str, difficulty: str, threshold: float = THRESHOLD) -> str:
    """Select the least expensive model that meets accuracy threshold for the given category and difficulty."""
    model_order = ['Llama-3.1-8B', 'GPT-4o-mini', 'o4-mini']
    row = performance[(performance['CATEGORY'] == category) & (performance['difficulty_labels'] == difficulty)]

    if row.empty:
        return model_order[-1]

    row = row.iloc[0]

    for m in model_order:
        if row[m] >= threshold:
            return m

    return model_order[-1]


app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    """Default endpoint to verify API status."""
    return {"message": "API running"}


class QuestionRequest(BaseModel):
    question: str
    answers: Optional[List[str]] = None

@app.post("/question")
def process_question(request: QuestionRequest):
    """Process a question by determining difficulty, routing to an LLM, and returning the selected model response.
    If no answers are provided, difficulty is computed only from question length and readability,
    and the query is sent without answer options."""

    question = request.question
    answers = request.answers

    difficult_score = heuristic_difficulty(question, answers)
    difficulty = difficulty_label(difficult_score)

    category = get_category(question)

    model_key = route_question(category, difficulty, THRESHOLD)

    model_mapping = {
        "o4-mini": "o4-mini",
        "GPT-4o-mini": "gpt-4o-mini",
        "Llama-3.1-8B": "llama-3.1-8b-instant"
    }

    mapped_model = model_mapping.get(model_key)

    # Build query depending on whether answers are provided
    if answers:
        query = f"{question}. Choose one of the following answers {answers}. Respond with just the answer."
    else:
        query = f"{question}. Respond with a concise answer."

    if mapped_model == 'llama-3.1-8b-instant':
        URL = "https://api.groq.com/openai/v1/chat/completions"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {CONFIG.get('groq_key')}"
        }

        data = {
            "model": mapped_model,
            "messages": [{"role": "user", "content": query}]
        }

        output = requests.post(URL, headers=headers, data=json.dumps(data)).json()
        if output["choices"]:
            output = output['choices'][0]['message']['content']

    else:
        client = OpenAI(
            base_url="https://dev-xton-cross-oai.openai.azure.com/openai/v1/",
            api_key=CONFIG.get('openai_key')
        )

        json_response = client.responses.create(model=mapped_model, input=query)
        try:
            output = json_response.output[0].content[0].text
        except:
            output = json_response.output[1].content[0].text

    return {
        "model": mapped_model,
        "category": category,
        "difficulty": difficulty,
        "output": output
    }