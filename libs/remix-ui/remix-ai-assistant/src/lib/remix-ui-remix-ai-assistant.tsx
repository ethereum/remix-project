import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../css/remix-ai-assistant.css'

import { ChatCommandParser, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import '../css/color.css'
import { Plugin } from '@remixproject/engine'

const _paq = (window._paq = window._paq || [])
const STORAGE_KEY = 'remix-ai-chat-history'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sentiment?: 'none' | 'like' | 'dislike'
}

export const assistantAvatar = 'assets/img/remixai-logoAI.webp'//'assets/img/aiLogo.svg'

const DEFAULT_SUGGESTIONS = [
  'Explain what a modifier is',
  'Explain what a UniSwap hook is',
  'What is a ZKP?'
]
export interface RemixUiRemixAiAssistantProps {
  plugin: Plugin
  queuedMessage: { text: string, timestamp: number } | null
}

export interface RemixUiRemixAiAssistantHandle {
  /** Programmatically send a prompt to the chat (returns after processing starts) */
  sendChat: (prompt: string) => Promise<void>
}

export const RemixUiRemixAiAssistant = React.forwardRef<
  RemixUiRemixAiAssistantHandle,
  RemixUiRemixAiAssistantProps
>(function RemixUiRemixAiAssistant(props, ref) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  // on first mount: hydrate from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      // comment out for now
      /*
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setMessages(parsed)
        }
      }
        */
    } catch (err) {
      console.warn('Could not restore saved chat history:', err)
    }
  }, [])

  // persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (err) {
      console.warn('Could not save chat history:', err)
    }
  }, [messages])

  const [isStreaming, setIsStreaming] = useState(false)
  const historyRef = useRef<HTMLDivElement | null>(null)
  const chatCmdParser = new ChatCommandParser(props.plugin)

  // always scroll to bottom when messages change
  useEffect(() => {
    const node = historyRef.current
    if (node && messages.length > 0) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages])

  // helper to toggle like / dislike feedback and push Matomo events
  const recordFeedback = (msgId: string, next: 'like' | 'dislike' | 'none') => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, sentiment: next } : m))
    )
    if (next === 'like') {
      ; (window as any)._paq?.push(['trackEvent', 'remixai-assistant', 'like-response'])
    } else if (next === 'dislike') {
      ; (window as any)._paq?.push(['trackEvent', 'remixai-assistant', 'dislike-response'])
    }
  }

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

  // reusable sender (used by both UI button and imperative ref)
  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim()
      if (!trimmed || isStreaming) return

      // optimistic user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, userMsg])

      /** append streaming chunks helper (kept identical) */
      const appendAssistantChunk = (msgId: string, chunk: string) => {
        setMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, content: m.content + chunk } : m))
        )
      }

      try {
        const parseResult = await chatCmdParser.parse(trimmed)
        if (parseResult) {
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: parseResult,
              timestamp: Date.now(),
              sentiment: 'none'
            }
          ])
          return
        }

        GenerationParams.stream_result = true
        GenerationParams.return_stream_response = true
        setIsStreaming(true)

        const pending = await props.plugin.call('remixAI', 'isChatRequestPending')
        const response = pending
          ? await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams)
          : await props.plugin.call('remixAI', 'solidity_answer', trimmed, GenerationParams)

        const assistantId = crypto.randomUUID()
        setMessages(prev => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), sentiment: 'none' }
        ])

        HandleStreamResponse(
          response,
          (chunk: string) => appendAssistantChunk(assistantId, chunk),
          (finalText: string) => {
            ChatHistory.pushHistory(trimmed, finalText)
            setIsStreaming(false)
          }
        )
      } catch (err) {
        console.error('AI request failed:', err)
        setIsStreaming(false)
      }
    },
    [isStreaming, props.plugin]
  )

  const handleSend = useCallback(async () => {
    await sendPrompt(input)
    setInput('')
  }, [input, sendPrompt])

  useImperativeHandle(
    ref,
    () => ({
      sendChat: async (prompt: string) => {
        await sendPrompt(prompt)
      }
    }),
    [sendPrompt]
  )

  return (
    <div
      className="ai-chat-container"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="chat-status small text-muted px-2">ready</div>
      <div
        ref={historyRef}
        className="ai-chat-history"
        style={{ flexGrow: 1, overflowY: 'auto' }}
      >
        {messages.length === 0 ? (
          <div className="assistant-landing d-flex flex-column align-items-center justify-content-center text-center px-3 h-100">
            <img src={assistantAvatar} alt="RemixAI logo" style={{ width: '120px' }} className="mb-3" />
            <h5 className="mb-2">RemixAI</h5>
            <p className="mb-4" style={{ maxWidth: '220px' }}>
              RemixAI provides you personalized guidance as you build. It can break down concepts,
              answer questions about blockchain technology and assist you with your smart contracts.
            </p>
            {DEFAULT_SUGGESTIONS.map(s => (
              <button
                key={s}
                className="btn btn-secondary mb-2 w-100"
                onClick={() => sendPrompt(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map(msg => {
            const bubbleClass =
              msg.role === 'user' ? 'bubble-user bg-light' : 'bubble-assistant bg-light'

            return (
              <div key={msg.id} className="chat-row d-flex mb-2">
                {/* Avatar for assistant */}
                {msg.role === 'assistant' && (
                  <img
                    src={assistantAvatar}
                    alt="AI"
                    className="assistant-avatar me-2 flex-shrink-0"
                  />
                )}

                {/* Bubble */}
                <div className="flex-grow-1">
                  <div className={`chat-bubble p-2 rounded ${bubbleClass}`}>
                    {msg.role === 'user' && (
                      <small className="text-uppercase fw-bold text-secondary d-block mb-1">
                        You
                      </small>
                    )}

                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        linkTarget="_blank"
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const text = String(children).replace(/\n$/, '')

                            if (inline) {
                              return (
                                <code className={className} {...props}>
                                  {text}
                                </code>
                              )
                            }

                            return (
                              <div
                                className="code-block position-relative"
                                style={{ marginBottom: '0.5rem' }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light position-absolute copy-btn"
                                  style={{ top: '0.25rem', right: '0.25rem' }}
                                  onClick={() => navigator.clipboard.writeText(text)}
                                >
                                  Copy
                                </button>
                                <pre className={className} {...props}>
                                  <code>{text}</code>
                                </pre>
                              </div>
                            )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Feedback buttons */}
                  {msg.role === 'assistant' && (
                    <div className="feedback text-end mt-2 me-1">
                      <span
                        role="button"
                        aria-label="thumbs up"
                        className={`feedback-btn me-3 ${
                          msg.sentiment === 'like' ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'
                        }`}
                        onClick={() =>
                          recordFeedback(
                            msg.id,
                            msg.sentiment === 'like' ? 'none' : 'like'
                          )
                        }
                      ></span>
                      <span
                        role="button"
                        aria-label="thumbs down"
                        className={`feedback-btn ml-2 ${
                          msg.sentiment === 'dislike'
                            ? 'fas fa-thumbs-down'
                            : 'far fa-thumbs-down'
                        }`}
                        onClick={() =>
                          recordFeedback(
                            msg.id,
                            msg.sentiment === 'dislike' ? 'none' : 'dislike'
                          )
                        }
                      ></span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="ai-chat-input d-flex pt-2">
        <input
          style={{ flexGrow: 1 }}
          type="text"
          className="form-control"
          value={input}
          disabled={isStreaming}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !isStreaming) handleSend()
          }}
          placeholder="Ask Remix AI…"
        />
        <button
          onClick={handleSend}
          disabled={isStreaming}
          className="btn btn-primary ms-2"
        >
          {isStreaming ? 'Streaming…' : 'Send'}
        </button>
      </div>
    </div>
  )
})
