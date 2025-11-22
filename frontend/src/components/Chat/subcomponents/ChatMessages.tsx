import React from 'react'
import AssistantMessage from './AssistantMessage'
import LoadingElement from './LoadingElement'
import './ChatMessages.css'

interface Message {
  role: string
  content: string
  modelo?: string
  category?: string
  difficulty?: string | number
}

interface Props {
  messages: Message[]
  messagesEndRef?: React.RefObject<HTMLDivElement | null>
  isLoading?: boolean
}

const ChatMessages: React.FC<Props> = ({ messages, messagesEndRef, isLoading = false }) => {
  return (
    <main className="chatbot-main">
      <div className="chatbot-messages">
        {messages.map((msg, idx) => {
          // animate only the latest assistant message
          const animate = msg.role === 'assistant' && idx === messages.length - 1
          if (msg.role === 'assistant') {
            return <AssistantMessage key={idx} message={msg} animate={animate} />
          }
          return (
            <div key={idx} className={`chatbot-message ${msg.role}`}>
              {msg.content}
            </div>
          )
        })}
        {isLoading && <LoadingElement />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  )
}

export default ChatMessages