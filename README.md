# GreenChoiceAI


Project that routes multiple-choice and open questions to the most cost-efficient LLM depending on predicted category and heuristic difficulty. It includes a FastAPI backend (`api.py`), a Vite + React frontend (`frontend/`), and an on-disk sentence embedder plus an SVM classifier for category prediction (`embedder/` and a `clasificador_svm.pkl` file expected at repository root).

**Authors:** Mario Gutiérrez, Jorge Martínez, Jose María Martín, Inés García

**Quick summary:** The backend computes a difficulty score from the input question (and optional answer choices), predicts a category using sentence embeddings + an SVM classifier, then selects the cheapest model that meets a minimum accuracy threshold (based on `tasa_aciertos.csv`). The selected LLM is queried and its final answer returned to the frontend.

---

**Demo**

- Watch a short demo video of the project on YouTube: [Demo video](https://www.youtube.com/watch?v=oRF_USztuf4)

---

**Repository layout**
- `api.py` : FastAPI backend entrypoint that processes questions and routes them to LLMs.
- `CONFIG.json` : Local configuration file used by `api.py` (contains API keys).
- `requirements.txt` : Python dependencies for the backend.
- `tasa_aciertos.csv` : Model performance table used for routing.
- `embedder/` : Folder containing a Sentence Transformer model and tokenizer assets.
- `frontend/` : Vite + React frontend application.

---

**Features & behavior**
- Difficulty estimation: `heuristic_difficulty` uses question length, Flesch reading ease, and answer-option similarity (text or numeric) to compute a score, mapped to labels (`Very low`, `Low`, `Medium`, `High`, `Very high`).
- Category prediction: A SentenceTransformer loaded from `embedder/` encodes the question and an SVM (`clasificador_svm.pkl`) predicts a category.
- Model routing: Uses `tasa_aciertos.csv` to choose the least expensive model that meets a configurable accuracy `THRESHOLD` (default 0.52). If no data exists, a safe fallback model is chosen.
- Multiple LLM integrations: mapping to providers (Groq / `llama-3.1-8b-instant`) and Azure/other OpenAI endpoints for other models.

---

Getting started (backend)

1. Create and activate a Python virtual environment (recommended):

```cmd
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```cmd
pip install -r requirements.txt
```

3. Provide API keys and configuration.

- The app reads `CONFIG.json` for keys (`groq_key`, `openai_key`) by default. For security, prefer setting environment variables and modifying `api.py` to read them instead of storing secrets in `CONFIG.json`.
- If `CONFIG.json` already contains keys in your local copy, rotate them and remove secrets from the repo before sharing.

4. Required artifacts (place in repository root or adjust paths in `api.py`):
- `clasificador_svm.pkl` : trained SVM model used by `get_category`.
- `embedder/` : local SentenceTransformer files (already present). The backend uses `SentenceTransformer('embedder')`.

5. Run the backend (development):

```cmd
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

The backend listens on port 8000 by default. The FastAPI app includes CORS settings that allow `http://localhost:5173` (the Vite dev server).

API Usage

- GET `/` — health check, returns a tiny JSON message.
- POST `/question` — process a question. Request body (JSON):

```json
{
  "question": "What is photosynthesis?",
  "answers": ["A", "B", "C"]  // optional
}
```

Response (JSON) contains at least:
- `model`: the vendor model name used for the query (e.g. `llama-3.1-8b-instant`, `gpt-4o-mini`, `o4-mini`).
- `category`: category predicted by the classifier.
- `difficulty`: difficulty label (Very low/Low/Medium/High/Very high).
- `output`: the string returned by the selected LLM (final answer only).

Example curl request:

```cmd
curl -X POST http://localhost:8000/question -H "Content-Type: application/json" -d "{\"question\":\"What is photosynthesis?\",\"answers\":null}"
```

Notes on internals

- Difficulty calculation: uses `textstat.flesch_reading_ease` and length. If answer choices are provided, similarity between options is considered — as text similarity or a scaled numerical difference when all options are numeric.
- Category prediction: `embedder.encode([input])` produces a vector passed to `clf.predict(emb)` where `clf` is loaded via `joblib.load('clasificador_svm.pkl')`.
- Routing: `route_question` looks up the row in `tasa_aciertos.csv` for the `(category, difficulty)` pair and iterates `model_order = ['Llama-3.1-8B', 'GPT-4o-mini', 'o4-mini']` to return the least expensive model that satisfies the `THRESHOLD`. The backend contains a model mapping to provider names and special-case request flows for Groq/`llama-3.1-8b-instant` and Azure OpenAI-like endpoints.

Frontend (development)

1. Move into the `frontend/` folder:

```cmd
cd frontend
```

2. Install dependencies (requires Node.js + npm):

```cmd
npm install
```

3. Run dev server:

```cmd
npm run dev
```

4. Open `http://localhost:5173` in the browser. The frontend communicates with the backend at `http://localhost:8000` by default (CORS allowed in `api.py`). If you change backend port/origin, update CORS and frontend API base URL accordingly.

Files and artifacts

- `tasa_aciertos.csv` : required for routing decisions. Do not edit structure unless you understand how `route_question` matches `CATEGORY` and `difficulty_labels`.
- `embedder/` : contains SentenceTransformer assets. The current code calls `SentenceTransformer('embedder')`, so the folder must be readable by the Python process.
- `clasificador_svm.pkl` : SVM classifier pickle file — required. If missing, category prediction will fail.

Troubleshooting & common errors

- Import errors for `sentence_transformers` or missing weights: Ensure `embedder/` is complete or change the `SentenceTransformer` instantiation to download a model from HuggingFace if desired.
- `joblib.load('clasificador_svm.pkl')` fails: place the trained pickle file at repository root or change the path in `api.py`.
- `requests` to external APIs return auth errors: verify `CONFIG.json` or environment variables and that the keys are valid and not expired.
- CORS failures: ensure the origin used by the frontend is included in `origins` inside `api.py` or use a wildcard carefully for development.

Security

- Never commit real API keys to the repo. `CONFIG.json` is convenient for local dev but insecure for shared repos — prefer reading keys from environment variables, or use a secrets manager.

---

**License & Contributing**

- **License:** This project is available under the MIT License — see the top-level `LICENSE` file for full terms.
- **Attribution:** Include the `LICENSE` file in redistributed copies and retain the copyright notice.
- **Contributions:** If you contribute, please open a pull request and include tests where applicable. Avoid committing credentials or large model artifacts directly into the repo; instead provide instructions for obtaining them.

