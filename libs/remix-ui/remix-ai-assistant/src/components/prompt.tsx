import { ActivityType } from "../lib/types"
import React from 'react'
import ContextOptMenu from "./contextOptMenu"

// PromptArea component
export interface PromptAreaProps {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  isStreaming: boolean
  handleSend: () => void
  showContextOptions: boolean
  setShowContextOptions: React.Dispatch<React.SetStateAction<boolean>>
  showAssistantOptions: boolean
  setShowAssistantOptions: React.Dispatch<React.SetStateAction<boolean>>
  contextChoice: 'none' | 'current' | 'opened' | 'workspace'
  setContextChoice: React.Dispatch<React.SetStateAction<'none' | 'current' | 'opened' | 'workspace'>>
  assistantChoice: 'openai' | 'mistralai' | 'anthropic'
  setAssistantChoice: React.Dispatch<React.SetStateAction<'openai' | 'mistralai' | 'anthropic'>>
  contextFiles: string[]
  clearContext: () => void
  handleAddContext: () => void
  handleSetAssistant: () => void
  handleGenerateWorkspace: () => void
  dispatchActivity: (type: ActivityType, payload?: any) => void
}

export const PromptArea: React.FC<PromptAreaProps> = ({
  input,
  setInput,
  isStreaming,
  handleSend,
  showContextOptions,
  setShowContextOptions,
  showAssistantOptions,
  setShowAssistantOptions,
  contextChoice,
  setContextChoice,
  assistantChoice,
  setAssistantChoice,
  contextFiles,
  clearContext,
  handleAddContext,
  handleSetAssistant,
  handleGenerateWorkspace,
  dispatchActivity
}) => {
  return (
    <>
      {showContextOptions && (
        <div
          className=" w-90 bg-light mb-1 p-2 border border-text"
          style={{ borderRadius: '8px'
          }}
        >
          <div className="text-uppercase ml-2 mb-2">Context</div>
          {/* <div className="d-flex ml-2 custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              id="ctx-none"
              checked={contextChoice === 'none'}
              onChange={() => {
                setContextChoice('none')
                setShowContextOptions(false)
              }}
            />
            <label className="form-check-label custom-control-label" data-id="none-context-option" htmlFor="ctx-none">
              None
            </label>
          </div>
          <div className="d-flex ml-2 custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              id="ctx-current"
              checked={contextChoice === 'current'}
              onChange={() => {
                setContextChoice('current')
                setShowContextOptions(false)
              }}
            />
            <label className="form-check-label custom-control-label" data-id="currentFile-context-option" htmlFor="ctx-current">
              Current file
            </label>
          </div>
          <div className="d-flex ml-2 custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              id="ctx-opened"
              checked={contextChoice === 'opened'}
              onChange={() => {
                setContextChoice('opened')
                setShowContextOptions(false)
              }}
            />
            <label className="form-check-label custom-control-label" data-id="allOpenedFiles-context-option" htmlFor="ctx-opened">
              All opened files
            </label>
          </div>
          <div className="d-flex ml-2 custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              id="ctx-workspace"
              checked={contextChoice === 'workspace'}
              onChange={() => {
                setContextChoice('workspace')
                setShowContextOptions(false)
              }}
            />
            <label className="form-check-label custom-control-label" data-id="workspace-context-option" htmlFor="ctx-workspace">
              Workspace
            </label>
          </div> */}
          <ContextOptMenu
            setContextChoice={setContextChoice}
            setShowContextOptions={setShowContextOptions}
            contextChoice={contextChoice}
          />
        </div>
      )}

      <div
        className="prompt-area d-flex flex-column gap-2 w-100 p-3"
      >
        <div className="d-flex justify-content-between mb-2">
          <button
            onClick={handleAddContext}
            data-id="composer-ai-add-context"
            className="btn btn-text btn-sm text-secondary small"
          >
          @Add context
          </button>

          <span
            className="bg-info p-1 text-ai small"
            data-id="composer-ai-workspace-generate"
          >
          Ai Beta
          </span>
        </div>
        <div className="ai-chat-input d-flex flex-column">
          <input
            style={{ flexGrow: 1 }}
            type="text"
            className="form-control bg-light"
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
            placeholder="Ask me anything, add workspace files..."
          />
          {showAssistantOptions && (
            <div
              className="p-3 mb-2 z-3 bg-dark border border-text position-absolute"
              style={{ top: '79dvh', left: '85dvw', right: '0px', bottom: '15px', height: '125px', width: '220px', borderRadius: '15px' }}
            >
              <div className="text-uppercase ml-2 mb-2">Choose Assistant Model</div>
              <div className="d-flex ml-2 custom-control custom-radio" key={'openai'}>
                <input
                  className="custom-control-input"
                  type="radio"
                  id={`assistant-openai`}
                  checked={assistantChoice === 'openai'}
                  onChange={() => {
                    setAssistantChoice('openai')
                    setShowAssistantOptions(false)
                  }}
                />
                <label className="form-check-label custom-control-label" htmlFor={`assistant-openai`}>
                    OpenAI
                </label>
              </div>
              <div className="d-flex ml-2 custom-control custom-radio" key={'mistralai'}>
                <input
                  className="custom-control-input"
                  type="radio"
                  id={`assistant-mistralai`}
                  checked={assistantChoice === 'mistralai'}
                  onChange={() => {
                    setAssistantChoice('mistralai')
                    setShowAssistantOptions(false)
                  }}
                />
                <label className="form-check-label custom-control-label" htmlFor={`assistant-mistralai`}>
                    MistralAI
                </label>
              </div>
              <div className="d-flex ml-2 custom-control custom-radio" key={'anthropic'}>
                <input
                  className="custom-control-input"
                  type="radio"
                  id={`assistant-anthropic`}
                  checked={assistantChoice === 'anthropic'}
                  onChange={() => {
                    setAssistantChoice('anthropic')
                    setShowAssistantOptions(false)
                  }}
                />
                <label className="form-check-label custom-control-label" htmlFor={`assistant-anthropic`}>
                    Anthropic
                </label>
              </div>
            </div>
          )}
          <button
            onClick={handleSetAssistant}
            className="btn btn-dark btn-sm text-secondary mt-2 align-self-end"
          >
            Set assistant&nbsp;
          </button>
        </div>
        {contextChoice !== 'none' && contextFiles.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-1 overflow-y-auto" style={{ maxHeight: '110px' }}>
            {contextFiles.slice(0, 6).map(f => {
              const name = f.split('/').pop()
              return (
                <span
                  key={f}
                  className="badge badge-info mr-1 aiContext-file text-success"
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
                className="badge badge-info"
                style={{ cursor: 'pointer' }}
                onClick={clearContext}
              >
              … {contextFiles.length - 6} more <i className="fa fa-times ms-1" style={{ cursor: 'pointer' }}></i>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}