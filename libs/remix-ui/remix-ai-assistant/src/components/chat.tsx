import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import copy from "copy-to-clipboard"
import { ChatMessage, assistantAvatar } from "../lib/types"
import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const DEFAULT_SUGGESTIONS = [
  'What is a modifier?',
  'What is a UniSwap hook?',
  'What is a ZKP?'
]

// ChatHistory component
export interface ChatHistoryComponentProps {
  messages: ChatMessage[]
  isStreaming: boolean
  sendPrompt: (prompt: string) => void
  recordFeedback: (msgId: string, next: 'like' | 'dislike' | 'none') => void
  historyRef: React.RefObject<HTMLDivElement>
}

const AiChatIntro = (props) => {
  return (
    <div className="assistant-landing d-flex flex-column align-items-center justify-content-center text-center px-3 h-100">
      <img src={assistantAvatar} alt="RemixAI logo" style={{ width: '120px' }} className="mb-3" />
      <h5 className="mb-2">RemixAI</h5>
      <p className="mb-4" style={{ fontSize: '1.1rem' }}>
            RemixAI provides you personalized guidance as you build. It can break down concepts,
            answer questions about blockchain technology and assist you with your smart contracts.
      </p>
      {DEFAULT_SUGGESTIONS.map((s, index) => (
        <button
          key={s}
          data-id={`remix-ai-assistant-starter-${index}`}
          className="btn btn-secondary mb-2 w-100 text-left"
          onClick={() => props.sendPrompt(s)}
        >
          <i className="fa-kit fa-remixai mr-2"></i>{s}
        </button>
      ))}
    </div>
  )
}

export const ChatHistoryComponent: React.FC<ChatHistoryComponentProps> = ({
  messages,
  isStreaming,
  sendPrompt,
  recordFeedback,
  historyRef
}) => {
  return (
    <div
      ref={historyRef}
      className="d-flex flex-column overflow-y-auto border-box-sizing preserve-wrap w-100"
    >
      {messages.length === 0 ? (
        <AiChatIntro sendPrompt={sendPrompt} />
      ) : (
        messages.map(msg => {
          const bubbleClass =
            msg.role === 'user' ? 'bubble-user bg-light' : 'bubble-assistant bg-light'

          return (
            <div key={msg.id} className="chat-row d-flex mb-2 w-100">
              {/* Avatar for assistant */}
              {msg.role === 'assistant' && (
                <img
                  src={assistantAvatar}
                  alt="AI"
                  className="assistant-avatar me-2 flex-shrink-0 mr-1"
                />
              )}

              {/* Bubble */}
              <div data-id="ai-response-chat-bubble-section" className="overflow-y-scroll w-100 mr-1">
                <div className={`chat-bubble p-2 rounded ${bubbleClass}`} data-id="ai-user-chat-bubble">
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
                              className="code-block p-2 border border-text d-flex align-items-center"
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
                        },
                        ul: ({ node, ...props }) => (
                          <ul
                            {...props}
                            style={{
                              listStylePosition: 'inside',
                              paddingLeft: '0.5rem'
                            }}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li {...props} style={{ padding: '1px' }} />
                        )
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
        }) //end of messages render
      )}
      {isStreaming && (
        <div className="text-center my-2">
          <i className="fa fa-spinner fa-spin fa-lg text-muted"></i>
        </div>
      )}
    </div>
  )
}

