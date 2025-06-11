import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../css/remix-ai-assistant.css'

import { ChatCommandParser, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import '../css/color.css'
import { Plugin } from '@remixproject/engine'
import { ModalTypes } from '@remix-ui/app'
import copy from 'copy-to-clipboard'

const _paq = (window._paq = window._paq || [])

export type ChatMessage = {
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
export type ActivityType =
  | 'typing'
  | 'button'
  | 'promptSend'
  | 'streamStart'
  | 'streamEnd'

export interface RemixUiRemixAiAssistantProps {
  plugin: Plugin
  queuedMessage: { text: string; timestamp: number } | null
  initialMessages?: ChatMessage[]
  onMessagesChange?: (msgs: ChatMessage[]) => void
  /** optional callback whenever the user or AI does something */
  onActivity?: (type: ActivityType, payload?: any) => void
}
export interface RemixUiRemixAiAssistantHandle {
  /** Programmatically send a prompt to the chat (returns after processing starts) */
  sendChat: (prompt: string) => Promise<void>
  /** Clears local chat history (parent receives onMessagesChange([])) */
  clearChat: () => void
  /** Returns current chat history array */
  getHistory: () => ChatMessage[]
}

export const RemixUiRemixAiAssistant = React.forwardRef<
  RemixUiRemixAiAssistantHandle,
  RemixUiRemixAiAssistantProps
>(function RemixUiRemixAiAssistant(props, ref) {
  const [messages, setMessages] = useState<ChatMessage[]>(props.initialMessages || [])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showContextOptions, setShowContextOptions] = useState(false)
  const [showAssistantOptions, setShowAssistantOptions] = useState(false)
  const [assistantChoice, setAssistantChoice] = useState<'openai' | 'mistralai' | 'anthropic'>(
    null
  )
  const [contextChoice, setContextChoice] = useState<'none' | 'current' | 'opened' | 'workspace'>(
    'none'
  )
  const historyRef = useRef<HTMLDivElement | null>(null)
  const chatCmdParser = new ChatCommandParser(props.plugin)

  const dispatchActivity = useCallback(
    (type: ActivityType, payload?: any) => {
      props.onActivity?.(type, payload)
    },
    [props.onActivity]
  )
  const [contextFiles, setContextFiles] = useState<string[]>([])
  const clearContext = () => {
    setContextChoice('none')
    setContextFiles([])
    props.plugin.call('remixAI', 'setContextFiles', { context: 'none' })
  }
  const refreshContext = useCallback(async (choice: typeof contextChoice) => {
    try {
      let files: string[] = []
      switch (choice) {
        case 'none':
          await props.plugin.call('remixAI', 'setContextFiles', { context: 'none' })
          files = []
          break
        case 'current':
          {
            const f = await props.plugin.call('fileManager', 'getCurrentFile')
            if (f) files = [f]
            await props.plugin.call('remixAI', 'setContextFiles', { context: 'currentFile' })
          }
          break
        case 'opened':
          {
            const res = await props.plugin.call('fileManager', 'getOpenedFiles')
            if (Array.isArray(res)) {
              files = res
            } else if (res && typeof res === 'object') {
              files = Object.values(res) as string[]
            }
            await props.plugin.call('remixAI', 'setContextFiles', { context: 'openedFiles' })
          }
          break
        case 'workspace':
          {
            await props.plugin.call('remixAI', 'setContextFiles', { context: 'workspace' })
            files = ['@workspace']
          }
          break
      }
      console.log('Setting context files:', files)
      setContextFiles(files)
    } catch (err) {
      console.error('Failed to refresh context:', err)
    }
  }, [props.plugin])


  useEffect(() => {
    const update = () => refreshContext(contextChoice)

    if (contextChoice === 'current' || contextChoice === 'opened') {
      props.plugin.on('fileManager', 'currentFileChanged', update)
      props.plugin.on('fileManager', 'fileClosed', update)
      return () =>
        props.plugin.off('fileManager', 'currentFileChanged')
    }
  }, [contextChoice, refreshContext, props.plugin])


  // bubble messages up to parent
  useEffect(() => {
    props.onMessagesChange?.(messages)
  }, [messages, props.onMessagesChange])


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

      dispatchActivity('promptSend', trimmed)

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
        setIsStreaming(true)
        const parseResult = await chatCmdParser.parse(trimmed)

        console.log('Parsed command:', parseResult)
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
          setIsStreaming(false)
          return
        }

        GenerationParams.stream_result = true
        GenerationParams.return_stream_response = true


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

  // Added handlers for special command buttons (assumed to exist)
  const handleAddContext = useCallback(() => {
    dispatchActivity('button', 'addContext')
    setShowAssistantOptions(false)
    setShowContextOptions(prev => !prev)
  }, [])

  const handleSetAssistant = useCallback(() => {
    dispatchActivity('button', 'setAssistant')
    setShowContextOptions(false)
    setShowAssistantOptions(prev => !prev)
  }, [])

  // Only send the /setAssistant command when the choice actually changes
  useEffect(() => {
    //console.log('Setting assistant to', assistantChoice)
    if (!assistantChoice) return
    dispatchActivity('button', 'setAssistant')
    sendPrompt(`/setAssistant ${assistantChoice}`)
  }, [assistantChoice])

  // refresh context whenever selection changes (even if selector is closed)
  useEffect(() => {
    // Optionally keep the log:
    // console.log('Context choice set to', contextChoice)
    refreshContext(contextChoice)
  }, [contextChoice, refreshContext])

  const handleGenerateWorkspace = useCallback(async () => {
    dispatchActivity('button', 'generateWorkspace')
    try {
      const description: string = await new Promise((resolve, reject) => {
        const modalContent = {
          id: 'generate-workspace',
          title: 'Generate Workspace',
          message: `
            Describe the kind of workspace you want RemixAI to scaffold. For example:
            ERC‑20 token with foundry tests
            ERC‑721 NFT collection with IPFS metadata
            Decentralized voting app with Solidity smart contracts
            
          `,
          modalType: ModalTypes.prompt, // single-line text
          okLabel: 'Generate',
          cancelLabel: 'Cancel',
          okFn: (value: string) => setTimeout(() => resolve(value), 0),
          cancelFn: () => setTimeout(() => reject(new Error('Canceled')), 0),
          hideFn: () => setTimeout(() => reject(new Error('Hide')), 0)
        }
        // @ts-ignore – the notification plugin's modal signature
        props.plugin.call('notification', 'modal', modalContent)
      })

      if (description && description.trim()) {
        sendPrompt(`/generate ${description.trim()}`)
      }
    } catch {
      /* user cancelled */
    }
  }, [props.plugin, sendPrompt])

  useImperativeHandle(
    ref,
    () => ({
      sendChat: async (prompt: string) => {
        await sendPrompt(prompt)
      },
      clearChat: () => {
        setMessages([])
      },
      getHistory: () => messages
    }),
    [sendPrompt, messages]
  )

  return (
    <div
      className="ai-chat-container"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div data-id="remix-ai-assistant-ready"></div>
      {/* hidden hook for E2E tests: data-streaming="true|false" */}
      <div
        data-id="remix-ai-streaming"
        className='d-none'
        data-streaming={isStreaming ? 'true' : 'false'}
      ></div>


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
                <i className="fa fa-user-robot-xmarks mr-2"></i>{s}
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
                    className="assistant-avatar me-2 flex-shrink-0 mr-1"
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
                              >
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light position-absolute copy-btn"
                                  style={{ top: '0.25rem', right: '0.25rem' }}
                                  onClick={() =>
                                    copy(text)
                                  }
                                >
                                  <i className="fa-regular fa-copy"></i>
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
                        className={`feedback-btn me-3 ${msg.sentiment === 'like' ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'
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
                        className={`feedback-btn ml-2 ${msg.sentiment === 'dislike'
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
        {isStreaming && (
          <div className="text-center my-2">
            <i className="fa fa-spinner fa-spin fa-lg text-muted"></i>
          </div>
        )}
      </div>

      {/* Prompt + special buttons */}
      <div
        className="prompt-area d-flex flex-column gap-2 p-2"
        style={{
          background: 'rgba(255,255,255,0.04)', // same dark tone as input row
          borderRadius: '4px'
        }}
      >
        {showContextOptions && (
          <div
            className="rounded p-3 mb-2"
          >
            <h6 className="text-uppercase small mb-3">Add Context Files</h6>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                id="ctx-none"
                checked={contextChoice === 'none'}
                data-id="none-context-option"
                onChange={() => {
                  setContextChoice('none')
                  setShowContextOptions(false)
                }}
              />
              <label className="form-check-label" htmlFor="ctx-none">
                None
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                id="ctx-current"
                data-id="currentFile-context-option"
                checked={contextChoice === 'current'}
                onChange={() => {
                  setContextChoice('current')
                  setShowContextOptions(false)
                }}
              />
              <label className="form-check-label" htmlFor="ctx-current">
                Current file
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                id="ctx-opened"
                data-id="allOpenedFiles-context-option"
                checked={contextChoice === 'opened'}
                onChange={() => {
                  setContextChoice('opened')
                  setShowContextOptions(false)
                }}
              />
              <label className="form-check-label" htmlFor="ctx-opened">
                All opened files
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="ctx-workspace"
                data-id="workspace-context-option"
                checked={contextChoice === 'workspace'}
                onChange={() => {
                  setContextChoice('workspace')
                  setShowContextOptions(false)
                }}
              />
              <label className="form-check-label" htmlFor="ctx-workspace">
                Workspace
              </label>
            </div>
          </div>
        )}
        {showAssistantOptions && (
          <div
            className="rounded p-3 mb-2"
          >
            <h6 className="text-uppercase small mb-3">Choose Assistant Model</h6>

            {['openai', 'mistralai', 'anthropic'].map(val => (
              <div className="form-check mb-2" key={val}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={`assistant-${val}`}
                  checked={assistantChoice === val}
                  onChange={() => {
                    setAssistantChoice(val as any)
                    setShowAssistantOptions(false)
                  }}
                />
                <label className="form-check-label" htmlFor={`assistant-${val}`}>
                  {val}
                </label>
              </div>
            ))}
          </div>
        )}
        <div className="d-flex gap-2 mb-2">
          <button
            onClick={handleAddContext}
            data-id="composer-ai-add-context"
            className={`btn mr-2 ${showContextOptions ? 'btn-primary' : 'btn-dark'}`}
          >
            @Add context&nbsp;
            <i className={`fa fa-caret-${showContextOptions ?  'down' : 'up'}`}></i>
          </button>

          <button
            onClick={handleSetAssistant}
            className={`btn mr-2 ${showAssistantOptions ? 'btn-primary' : 'btn-dark'}`}

          >
            @Set assistant&nbsp;
            <i className={`fa fa-caret-${showAssistantOptions ? 'down' : 'up'}`}></i>
          </button>

          <button
            onClick={handleGenerateWorkspace}
            className="btn btn-dark"
            data-id="composer-ai-workspace-generate"

          >
            @Generate Workspace
          </button>


        </div>


        <div className="ai-chat-input">
          <input
            style={{ flexGrow: 1 }}
            type="text"
            className="form-control"
            value={input}
            disabled={isStreaming}
            onFocus={() => {
              dispatchActivity('typing', input)
            }}
            onChange={e => {
              dispatchActivity('typing', e.target.value)
              setInput(e.target.value)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !isStreaming) handleSend()
            }}
            placeholder="Ask me anything, use button to add context..."
          />
        </div>
        {contextChoice !== 'none' && contextFiles.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-1" style={{ maxHeight: '110px', overflowY: 'auto' }}>
            {contextFiles.slice(0, 6).map(f => {
              const name = f.split('/').pop()
              return (
                <span
                  key={f}
                  className="badge badge-pill badge-secondary mr-1 aiContext-file"
                  style={{ cursor: 'pointer' }}
                  onClick={clearContext}
                >
                  {name}
                  <i className="fa fa-times ms-1 ml-1" style={{ cursor: 'pointer' }}></i>
                </span>
              )
            })}
            {contextFiles.length > 6 && (
              <span
                className="badge badge-pill badge-secondary"
                style={{ cursor: 'pointer' }}
                onClick={clearContext}
              >
                … {contextFiles.length - 6} more <i className="fa fa-times ms-1" style={{ cursor: 'pointer' }}></i>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
