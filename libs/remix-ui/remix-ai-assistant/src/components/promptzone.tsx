// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PluginNames } from 'apps/remix-ide/src/types'
import React, { useReducer, useState } from 'react'
import { FormattedMessage } from 'react-intl'

interface PromptZoneProps {
  value?: string
  onChangeHandler?: (prompt: string) => void
  onSubmitHandler?: () => void
  makePluginCall: (pluginName: PluginNames, methodName: string, payload?: any) => Promise<any>
}

type PromptState = {
  selectContext: boolean
  files: string[] | '@workspace'
  currentSelection: 'workspace' | 'currentFile' | 'allOpenedFiles' | ''
}

type PromptAction = {
  type: 'CURRENT_FILE'
  payload: {
    file: string
    selection: 'workspace' | 'currentFile' | 'allOpenedFiles'
    selectContext: boolean
  }
} | {
  type: 'ALL_OPENED_FILES'
  payload: {
    files: string[]
    selection: 'workspace' | 'currentFile' | 'allOpenedFiles'
    selectContext: boolean
  }
} | {
  type: 'WORKSPACE'
  payload: {
    files: '@workspace'
    selection: 'workspace' | 'currentFile' | 'allOpenedFiles'
    selectContext: boolean
  }
} | {
  type: 'ADD_CONTEXT'
  payload: boolean
} | {
  type: 'REMOVE_FILE'
  payload: string
} | {
  type: 'REMOVE_ALL_FILES'
}

const initialState: PromptState = {
  selectContext: false,
  currentSelection: '',
  files: [],
}

const stripFileName = (file: string) => {
  return file.split('/').pop()
}

function promptReducer(state:PromptState, action: PromptAction) {
  switch (action.type) {
  case 'CURRENT_FILE':
    return { ...state, files: [...state.files, stripFileName(action.payload.file)], currentSelection: action.payload.selection, selectContext: action.payload.selectContext }
  case 'ALL_OPENED_FILES':
    return { ...state, files: action.payload.files.map(stripFileName), currentSelection: action.payload.selection, selectContext: action.payload.selectContext }
  case 'WORKSPACE':
    return { ...state, files: '@workspace', currentSelection: 'workspace', selectContext: action.payload.selectContext }
  case 'ADD_CONTEXT':
    return { ...state, selectContext: action.payload }
  case 'REMOVE_FILE':
    return {
      ...state,
      files: Array.isArray(state.files) ? state.files.filter((file) => file !== action.payload) : []
    }
  case 'REMOVE_ALL_FILES':
    return { ...state, files: [], currentSelection: '', selectContext: false }
  default:
    return state
  }
}

export default function PromptZone(props: PromptZoneProps) {
  const [promptState, promptDispatch] = useReducer(promptReducer, initialState)

  const removeFile = (file: string) => {
    console.log('removing file', file)
    promptDispatch({ type: 'REMOVE_FILE', payload: file })
  }
  const removeAllFiles = () => {
    promptDispatch({ type: 'REMOVE_ALL_FILES' })
  }
  const addFile = (file: string) => {}
  const addWorkspace = () => {}

  return (
    <section className="w-100 mt-auto ai-assistant-bottom-height d-flex flex-column align-items-end border-danger mb-3">
      {promptState.selectContext && <div className="d-flex flex-column border w-100 px-3 pt-3 align-items-start justify-content-center align-self-start">
        <div className="text-uppercase mb-2 ml-2">Add context files</div>
        <ul className="list-unstyled">
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="feature" value="currentFile" id="currentFile" onChange={async () => {
                await props.makePluginCall('remixAI', 'setContextFiles', { context: 'currentFile' })
                const result = await props.makePluginCall('fileManager', 'getCurrentFile')
                promptDispatch({ type: 'CURRENT_FILE', payload: {
                  file: result, selection: 'currentFile', selectContext: !promptState.selectContext
                } })
              }} checked={promptState.currentSelection === 'currentFile'} />
              <label className="form-check-label custom-control-label" htmlFor="currentFile" data-id="currentFile-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                Current file
              </label>
            </div>
          </li>
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="feature" value="allOpenedFiles" id="allOpenedFiles" onChange={ async () => {
                await props.makePluginCall('remixAI', 'setContextFiles', { context: 'openedFiles' })
                const result = await props.makePluginCall('fileManager', 'getOpenedFiles')
                promptDispatch({ type: 'ALL_OPENED_FILES', payload: { files: Object.keys(result), selection: 'allOpenedFiles', selectContext: !promptState.selectContext } })
              }} checked={promptState.currentSelection === 'allOpenedFiles'} />
              <label className="form-check-label custom-control-label" htmlFor="allOpenedFiles" data-id="allOpenedFiles-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                All opened files
              </label>
            </div>
          </li>
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="workspace-context"
                value={promptState.currentSelection} id="workspace" onChange={ async () => {
                  await props.makePluginCall('remixAI', 'setContextFiles', { context: 'workspace' })
                  promptDispatch({ type: 'WORKSPACE', payload: { files: '@workspace', selection: 'workspace', selectContext: !promptState.selectContext } })
                }} checked={promptState.currentSelection === 'workspace'} />
              <label className="form-check-label custom-control-label" htmlFor="workspace" data-id="workspace-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                Workspace
              </label>
            </div>
          </li>
        </ul>
      </div>}
      <div className="bg-light d-flex flex-column w-100 p-3 mb-4">
        <div className="mb-3">
          <button
            className="btn bg-dark btn-sm text-secondary"
            onClick={() => promptDispatch({ type: 'ADD_CONTEXT', payload: !promptState.selectContext })}
          >{"@ Add context"}</button>
        </div>
        <div className="mb-3">
          <textarea
            className="form-control bg-light"
            placeholder="Ask me anything, use @ to mention a file"
            value={props.value}
            // onChange={(e) => props.onChangeHandler(e.target.value)}
            // onKeyDown={handleEnter}
          />
        </div>
        <RenderIf condition={promptState.files.length > 0}>
          <div id="context-holder" className="d-flex gap-2 text-white justify-content-start align-items-center flex-wrap text-success py-3 border-warning overflow-y-scroll">
            {Array.isArray(promptState.files) ? promptState.files.slice(0, 4).map((file: string, index: number) => {
              return (
                <span key={index} className="badge badge-info text-success p-1 rounded m-1 text-truncate">
                  {file} <i className="fas fa-times" style={{ cursor: 'pointer' }} onClick={() => removeFile(file)}></i>
                </span>
              )
            }) : (
              <span className="badge badge-info text-success p-1 rounded m-1" onClick={() => removeFile(promptState.files as string)}>
                {promptState.files} <i className="fas fa-times" style={{ cursor: 'pointer' }} onClick={() => removeFile(promptState.files as string)}></i>
              </span>
            )}
            <RenderIf condition={promptState.files.length > 4 && promptState.files !== '@workspace'}>
              <>
                <span className="badge badge-info text-success p-1 rounded m-1">
                  {promptState.files.length - 4} more files
                </span>
                <span style={{ cursor: 'pointer' }} className="badge badge-info text-success p-1 rounded m-1" onClick={() => removeAllFiles()}>
                Remove all <i className="fas fa-times"></i>
                </span>
              </>
            </RenderIf>
          </div>
        </RenderIf>
      </div>
    </section>
  )
}