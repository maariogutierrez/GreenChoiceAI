import React, { useEffect, useState, useRef } from 'react'

interface Message {
  role: string
  content: string
  modelo?: string
  category?: string
  difficulty?: string | number
}

interface Props {
  message: Message
  animate?: boolean
  speed?: number // ms per character
}

const AssistantMessage: React.FC<Props> = ({ message, animate = false, speed = 13 }) => {
  const text = message.content
  const [display, setDisplay] = useState<string>(animate ? '' : text)
  // local done state to hide typing caret once the animation completes
  const [done, setDone] = useState<boolean>(!animate)
  const mountedRef = useRef(false)

  useEffect(() => {
    // if not animating, show full text and mark done
    if (!animate) {
      setDisplay(text)
      setDone(true)
      return
    }

    // start animation
    let i = 0
    setDisplay('')
    setDone(false)
    mountedRef.current = true

    let timeoutId: number | undefined
    const id = window.setInterval(() => {
      i += 1
      setDisplay(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
        // keep the caret visible for a short moment, then hide it
        timeoutId = window.setTimeout(() => setDone(true), 300)
      }
    }, speed)

    return () => {
      window.clearInterval(id)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [text, animate, speed])

  return (
    <div className={`chatbot-message assistant`}>
      <div>
        <span>{display}</span>
        {animate && !done && <span className="typing-caret" aria-hidden="true" />}
      </div>

      {/* metadata area: model, difficulty, category */}
      {(message.modelo || message.difficulty || message.category) && (
        <div className="message-meta" aria-hidden={false}>
          {message.difficulty !== undefined && (
            <div className="meta-item">
              <span className="meta-icon" aria-hidden>🔥</span>
              <strong style={{ marginLeft: 6, marginRight: 6 }}>Difficulty</strong>
              <span>{String(message.difficulty)}</span>
            </div>
          )}

          {message.modelo && (
            <div className="meta-item" style={{ marginLeft: 12 }}>
              <span className="meta-icon" aria-hidden>🤖</span>
              <strong style={{ marginLeft: 6, marginRight: 6 }}>Model</strong>
              <span>{message.modelo}</span>
            </div>
          )}

          {message.category && (
            <div className="meta-item" style={{ marginLeft: 12 }}>
              <span className="meta-icon" aria-hidden>📂</span>
              <strong style={{ marginLeft: 6, marginRight: 6 }}>Category</strong>
              <span>{message.category}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AssistantMessage
