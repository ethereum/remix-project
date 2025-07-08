import { ActivityType } from "../lib/types"
import React, { MutableRefObject, Ref, useEffect, useRef, useState } from 'react'
import GroupListMenu from "./contextOptMenu"
import { AiContextType, groupListType } from '../types/componentTypes'
import { AiAssistantType } from '../types/componentTypes'
import { useOnClickOutside } from "../hooks/useOnClickOutsideButton"

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
  contextChoice: AiContextType
  setContextChoice: React.Dispatch<React.SetStateAction<AiContextType>>
  assistantChoice: AiAssistantType
  setAssistantChoice: React.Dispatch<React.SetStateAction<AiAssistantType>>
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
  const aiContextGroupList: groupListType[] = [
    {
      label: 'None',
      bodyText: 'Assistant will automatically decide the context',
      icon: 'fa-solid fa-check',
      stateValue: 'none',
      dataId: 'composer-ai-context-none'
    },
    {
      label: 'Current file',
      bodyText: 'Add the current file in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'current',
      dataId: 'currentFile-context-option'
    },
    {
      label: 'All opened files',
      bodyText: 'Adds all files opened in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'opened',
      dataId: 'allOpenedFiles-context-option'
    },
    {
      label: 'Workspace',
      bodyText: 'Uses the current workspace as context',
      icon: 'fa-solid fa-check',
      stateValue: 'workspace',
      dataId: 'workspace-context-option'
    }
  ]

  const aiAssistantGroupList: groupListType[] = [
    {
      label: 'OpenAI',
      bodyText: 'Better for general purpose coding tasks',
      icon: 'fa-solid fa-check',
      stateValue: 'openai',
      dataId: 'composer-ai-assistant-openai'
    },
    {
      label: 'MistralAI',
      bodyText: 'Better for more complex coding tasks with solidity, typescript and more',
      icon: 'fa-solid fa-check',
      stateValue: 'mistralai',
      dataId: 'composer-ai-assistant-mistralai'
    },
    {
      label: 'Anthropic',
      bodyText: 'Best for complex coding tasks but most demanding on resources',
      icon: 'fa-solid fa-check',
      stateValue: 'anthropic',
      dataId: 'composer-ai-assistant-anthropic'
    }
  ]
  const modelBtnRef = useRef(null)
  const contextBtnRef = useRef(null)
  const [currentPosition, setCurrentPosition] = useState(0)

  const getBoundingRect = (ref: MutableRefObject<any>) => ref.current?.getBoundingClientRect()
  const calcAndConvertToDvh = (coordValue: number) => (coordValue / window.innerHeight) * 100
  const calcAndConvertToDvw = (coordValue: number) => (coordValue / window.innerWidth) * 100
  useOnClickOutside([modelBtnRef, contextBtnRef], () => setShowAssistantOptions(false))
  useOnClickOutside([modelBtnRef, contextBtnRef], () => setShowContextOptions(false))

  return (
    <>
      {showContextOptions && (
        <div
          className="bg-light mb-1 p-2 border border-text position-absolute"
          style={{ borderRadius: '8px', zIndex: 99999, left: `${calcAndConvertToDvh(getBoundingRect(contextBtnRef).left)}dvh`, right: '0px', bottom: '177px', height: '300px', width: '300px' }}
        >
          <div className="text-uppercase ml-2 mb-2">Context</div>
          <GroupListMenu
            setChoice={setContextChoice}
            setShowOptions={setShowContextOptions}
            choice={contextChoice}
            groupList={aiContextGroupList}
          />
        </div>
      )}

      <div
        className="prompt-area d-flex flex-column gap-2 w-100 p-3 border border-text remix-aichat-background align-self-start"
      >
        <div className="d-flex justify-content-between mb-3 border border-right-0 border-left-0 border-top-0 border-bottom">
          <button
            onClick={handleAddContext}
            data-id="composer-ai-add-context"
            className="btn btn-dim btn-sm text-light small font-weight-light border border-text rounded"
            ref={contextBtnRef}
          >
          @Add context
          </button>

          <span
            className="badge align-self-center badge-info text-ai font-weight-light rounded"
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
              className="pt-2 mb-2 z-3 bg-light border border-text position-absolute"
              style={{ left: `${calcAndConvertToDvw(getBoundingRect(modelBtnRef).left)}dvw`, right: '0px', bottom: '75px', height: '235px', width: '300px', borderRadius: '8px' }}
            >
              <div className="text-uppercase ml-2 mb-2 small">AI Assistant Provider</div>
              <GroupListMenu
                setChoice={setAssistantChoice}
                setShowOptions={setShowAssistantOptions}
                choice={assistantChoice}
                groupList={aiAssistantGroupList}
              />
            </div>
          )}
          <div className="d-flex justify-content-between">
            <button
              onClick={handleSetAssistant}
              className="btn btn-text btn-sm small font-weight-light text-secondary mt-2 align-self-end border border-text rounded"
              ref={modelBtnRef}
            >
              {'Provider '}
              {assistantChoice === 'openai' && ' OpenAI'}
              {assistantChoice === 'mistralai' && ' MistralAI'}
              {assistantChoice === 'anthropic' && ' Anthropic'}
              {'  '}
              <span className={showAssistantOptions ? "fa fa-caret-up" : "fa fa-caret-down"}></span>
            </button>
            <button
              data-id="remix-ai-workspace-generate"
              className="btn btn-text btn-sm small font-weight-light text-secondary mt-2 align-self-end border border-text rounded"
              onClick={handleGenerateWorkspace}
            >
              {'@Generate'}
            </button>
            {/* <button
              className={input.length > 0 ? 'btn bg-ai border-text border btn-sm font-weight-light text-secondary mt-2 align-self-end' : 'btn btn-text border-text border btn-sm font-weight-light text-secondary mt-2 align-self-end disabled'}
              style={{ backgroundColor: input.length > 0 ? '#2de7f3' : 'transparent' }}
              onClick={handleSend}
            >
              <span className="fa fa-arrow-up text-light"></span>
            </button> */}
          </div>
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
