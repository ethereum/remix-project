import { ActivityType } from "../lib/types"
import React from 'react'

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
          <i className={`fa fa-caret-${showContextOptions ? 'down' : 'up'}`}></i>
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
  )
}