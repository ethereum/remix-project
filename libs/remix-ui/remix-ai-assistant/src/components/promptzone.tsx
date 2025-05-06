import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'

interface PromptZoneProps {
  value: string
  onChangeHandler: (prompt: string) => void
  onSubmitHandler: () => void
}

export default function PromptZone(props: PromptZoneProps) {
  const [selectContext, setSelectContext] = useState(false)
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      props.onSubmitHandler()
    }
  }

  return (
    <section className="w-100 mt-auto ai-assistant-bottom-height d-flex flex-column align-items-end border-danger mb-3">
      {selectContext && <div className="d-flex flex-column border w-100 px-3 pt-3 align-items-start justify-content-center align-self-start">
        <div className="text-uppercase mb-2 ml-2">Add context files</div>
        <ul className="list-unstyled">
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="feature" value="currentFile" id="currentFile" onChange={() => {}} />
              <label className="form-check-label custom-control-label" htmlFor="currentFile" data-id="currentFile-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                Current file
              </label>
            </div>
          </li>
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="feature" value="allOpenedFiles" id="allOpenedFiles" onChange={() => {}} />
              <label className="form-check-label custom-control-label" htmlFor="allOpenedFiles" data-id="allOpenedFiles-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                All opened files
              </label>
            </div>
          </li>
          <li>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="workspace-context" value="workspace" id="workspace" onChange={() => {}} />
              <label className="form-check-label custom-control-label" htmlFor="workspace" data-id="workspace-context-option">
                {/* <FormattedMessage id="filePanel.mintable" /> */}
                Workspace
              </label>
            </div>
          </li>
        </ul>
      </div>}
      <div className="bg-light d-flex flex-column w-100 p-3">
        <div className="mb-3">
          <button
            className="btn bg-dark btn-sm text-secondary"
            onClick={() => setSelectContext(!selectContext)}
          >{"@ Add context"}</button>
        </div>
        <div className="mb-3">
          <textarea
            className="form-control bg-light"
            placeholder="Ask me anything, use @ to mention a file"
            value={props.value}
            // onChange={(e) => props.onChangeHandler(e.target.value)}
            onKeyDown={handleEnter}
          />
        </div>
        <div id="context-holder" className="d-flex flex-row text-white justify-content-start align-items-center flex-wrap text-success">
          <span className="bg-info p-1 rounded">file1.sol <i className="fas fa-times"></i></span>
          <span className="bg-info p-1 rounded ml-2">file2.sol <i className="fas fa-times"></i></span>
          <span className="bg-info p-1 rounded ml-2">file3.sol <i className="fas fa-times"></i></span>
        </div>
      </div>
    </section>
  )
}