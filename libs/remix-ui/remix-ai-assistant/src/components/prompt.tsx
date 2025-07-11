import { ActivityType } from "../lib/types"
import React, { MutableRefObject, Ref, useEffect, useRef, useState } from 'react'
import GroupListMenu from "./contextOptMenu"
import { AiContextType, groupListType } from '../types/componentTypes'
import { AiAssistantType } from '../types/componentTypes'
import { CustomTooltip } from "@remix-ui/helper"

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
  contextBtnRef: React.RefObject<HTMLButtonElement>
  modelBtnRef: React.RefObject<HTMLButtonElement>
  aiContextGroupList: groupListType[]
  aiAssistantGroupList: groupListType[]
}

const _paq = (window._paq = window._paq || [])

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
  dispatchActivity,
  contextBtnRef,
  modelBtnRef,
  aiContextGroupList,
  aiAssistantGroupList
}) => {

  return (
    <>
      {showContextOptions && (
        <div
          className="bg-light mb-1 p-2 border border-text"
          style={{ borderRadius: '8px' }}
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
        className="prompt-area d-flex flex-column gap-2 w-100 p-3 border border-text bg-light align-self-start"
      >
        <div className="d-flex justify-content-between mb-3 border border-right-0 border-left-0 border-top-0 border-bottom pb-1">
          <button
            onClick={handleAddContext}
            data-id="composer-ai-add-context"
            className="btn btn-dim btn-sm text-secondary small font-weight-light border border-text rounded"
            ref={contextBtnRef}
          >
          @Add context
          </button>

          <div className="d-flex justify-content-center align-items-center">
            <CustomTooltip
              tooltipText={<TooltipContent />}
              delay={{ show: 1000, hide: 0 }}
            >
              <span
                className="far fa-circle-info text-ai mr-1"
                onMouseEnter={() => _paq.push(['trackEvent', 'remixAI', 'AICommandTooltip', 'User clicked on AI command info'])}
              ></span>
            </CustomTooltip>
            <span
              className="badge align-self-center badge-info font-weight-light rounded"
            >
              AI Beta
            </span>
          </div>
        </div>
        <div className="ai-chat-input d-flex flex-column">
          <textarea
            style={{ flexGrow: 1 }}
            rows={2}
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

          <div className="d-flex justify-content-between">
            <button
              onClick={handleSetAssistant}
              className="btn btn-text btn-sm small font-weight-light text-secondary mt-2 align-self-end border border-text rounded"
              ref={modelBtnRef}
            >
              {assistantChoice === null && 'Default'}
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

function TooltipContent () {
  return (
    <ul className="list-unstyled p-2 mr-3">
      <li className="">
        {'- Use /w <prompt> : To manage or edit files within your workspace'}
      </li>
      <li className="">
        {'- Alternatively, you may type your question directly below.'}
      </li>
    </ul>
  )
}
