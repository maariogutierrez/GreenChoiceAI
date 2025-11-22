import React, { useState, useRef, useEffect } from 'react'

import Sidebar from './subcomponents/Sidebar'
import Header from './subcomponents/Header'
import InitialHello from './subcomponents/InitialHello'
import ChatMessages from './subcomponents/ChatMessages'
import ChatInput from './subcomponents/ChatInput'

import './ChatApp.css'

type Message = {
  role: string
  content: string
  modelo?: string
  category?: string 
  difficulty?: string | number
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

    const handleSend = async (e: React.FormEvent, extras?: { answers?: string[] }) => {
      e.preventDefault()
      if (!input.trim()) return

      // add the user's message immediately (show the question)
      setMessages(prev => [...prev, { role: 'user', content: input }])
      const question = input
      const answers = extras?.answers?.map(c => c.trim()).filter(Boolean) ?? []
      setInput('')

      try {
        setIsLoading(true)
        // TODO: implement request to API with identification (token or session cookie)
  const payload: any = { question }
  if (answers.length) payload.answers = answers

        const res = await fetch('http://localhost:8000/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`)
        }

        const ct = res.headers.get('content-type') || ''
        let output: string 
        let modelo: string 
        let difficulty: string | number 
        let category: string 

        if (ct.includes('application/json')) {
          const json = await res.json()
          // API v1 returns: { modelo, category, difficulty, output }
          output = (json.output ?? json.answer ?? json.reply ?? json.response ?? json.message) || ''
          modelo = (json.modelo ?? json.model) || ''
          difficulty = json.difficulty || ''
          category = json.category || ''
        } else {
          output = await res.text()
        }

        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: output, modelo, difficulty, category },
        ])
        setIsLoading(false)
      } catch (err) {
        console.error('Error sending question:', err)
        setMessages(prev => [
          ...prev,
        // { role: 'assistant', content: 'Lo siento, no pude obtener una respuesta del servidor en este momento.' },
        {role: 'assistant', content: 'Esto es una pregunta falsa', modelo: 'gpt-4', difficulty: 'media', category: 'general' },
        ])
        setIsLoading(false)
      }
    }

  const hasMessages = messages.length > 0

  return (
    <div className="chat-layout">
      <Sidebar />

      <main>
        <Header />
        <div className={`chat-container ${hasMessages ? 'has-messages' : 'empty'}`}>
          {/* When there are no messages, center the greeting and the input */}
          {!hasMessages ? (
            <div className="initial-center">
              <InitialHello />
              <div className="center-input-wrapper">
                <ChatInput input={input} setInput={setInput} handleSend={handleSend} className="centered" />
              </div>
            </div>
          ) : (
            // Normal chat view: messages scroll area + sticky input at bottom
            <>
              <ChatMessages messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />
              <div className="bottom-input-wrapper">
                <ChatInput input={input} setInput={setInput} handleSend={handleSend} className="sticky" />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ChatApp