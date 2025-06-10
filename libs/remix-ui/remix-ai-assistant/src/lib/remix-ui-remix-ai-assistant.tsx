import React, { useState, useEffect, useCallback } from 'react'
import '../css/remix-ai-assistant.css'

import { ChatCommandParser, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import '../css/color.css'
import { Plugin } from '@remixproject/engine'

const _paq = (window._paq = window._paq || [])

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export const assistantAvatar = 'assets/img/remixai-logoDefault.webp'//'assets/img/aiLogo.svg'
export interface RemixUiRemixAiAssistantProps {
  //plugin: Plugin,
  queuedMessage: { text: string, timestamp: number } | null
}

export function RemixUiRemixAiAssistant (props: RemixUiRemixAiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  // Push a queued message (if any) into history once props update
  useEffect(() => {
    if (props.queuedMessage) {
      const { text, timestamp } = props.queuedMessage
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: text, timestamp }
      ])
    }
  }, [props.queuedMessage])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // optimistic user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      // Call your backend AI route (adjust URL as needed)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })
      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error('AI request failed:', err)
    }
  }, [input, messages])

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-history">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`ai-chat-message ${
              msg.role === 'user' ? 'from-user' : 'from-assistant'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="ai-chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend()
          }}
          placeholder="Ask Remix AI…"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}