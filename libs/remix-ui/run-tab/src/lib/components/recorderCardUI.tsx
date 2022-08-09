// eslint-disable-next-line no-use-before-define
import React, {useRef, useState, useEffect} from 'react'
import { RecorderProps } from '../types'
import { OverlayTrigger, Tooltip } from 'react-bootstrap' // eslint-disable-line

export function RecorderUI (props: RecorderProps) {
  const inputLive = useRef<HTMLInputElement>()
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)
  const [enableRunButton, setEnableRunButton] = useState<boolean>(true)
  const triggerRecordButton = () => {
    props.storeScenario(props.scenarioPrompt)
  }

  const handleClickRunButton = () => {
    const liveMode = inputLive.current ? inputLive.current.checked : false
    props.runCurrentScenario(liveMode, props.gasEstimationPrompt, props.passphrasePrompt, props.mainnetPrompt)
  }

  useEffect(() => {
    if (props.currentFile && props.currentFile.endsWith('.json')) setEnableRunButton(false)
    else setEnableRunButton(true)
  }, [props.currentFile])

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }


  return (
    <div className="udapp_cardContainer list-group-item border border-bottom">
      <div className="udapp_recorderSection d-flex justify-content-between" onClick={toggleClass}>
        <div className="d-flex justify-content-center align-items-center">
          <label className="mt-1 udapp_recorderSectionLabel">Transactions recorded</label>
          <div className="ml-2 badge badge-pill badge-primary text-center" title="The number of recorded transactions">{props.count}</div>
        <OverlayTrigger placement={'right'} overlay={
          <Tooltip className="text-nowrap" id="info-recorder">
            <span>Save transactions (deployed contracts and function executions) and replay them in another environment. <br/> e.g Transactions created in Remix VM can be replayed in the Injected Provider.
          </span>
          </Tooltip>
        }>
          <i style={{ fontSize: 'medium' }} className={'ml-2 fal fa-info-circle align-self-center'} aria-hidden="true"></i>
        </OverlayTrigger>
        </div>
        <div className="p-3">
          <span data-id='udappRecorderTitleExpander' onClick={toggleClass}>
            <i className={!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down'} aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div className={`flex-column ${toggleExpander ? "d-flex" : "d-none"}`}>
        <div className="mb-1 mt-1 fmt-2 custom-control custom-checkbox mb-1">
          <input ref={inputLive} type="checkbox" id="livemode-recorder" className="custom-control-input custom-select" name="input-livemode"/>
          <OverlayTrigger placement={'right'} overlay={
            <Tooltip className="text-nowrap" id="tooltip-livemode-recorder">
              <span>If contracts are updated after recording transactions, checking this box<br/>will run recorded transactions with the latest copy of the compiled contracts</span>
            </Tooltip>
          }>
          <label className="form-check-label custom-control-label" data-id="runtabLivemodeInput" htmlFor="livemode-recorder">Run transactions using the latest compilation result</label>
          </OverlayTrigger>
        </div>
        <div className="mb-1 mt-1 udapp_transactionActions">
        <OverlayTrigger placement={'right'} overlay={
          <Tooltip className="text-nowrap" id="tooltip-save-recorder">
            <span>Save {props.count} transaction{props.count === 1 ? '' : 's'} as scenario file</span>
          </Tooltip>
        }>
          <button className="btn btn-sm btn-info savetransaction udapp_recorder" title={props.count === 0 ? 'No transactions to save' : ''} disabled={props.count === 0 ? true: false} onClick={triggerRecordButton}>Save</button>
        </OverlayTrigger>
        <OverlayTrigger placement={'right'} overlay={
          <Tooltip className="text-nowrap" id="tooltip-run-recorder">
            <span>Run transaction(s) from the current scenario file</span>
          </Tooltip>
        }>
          <button className="btn btn-sm btn-info runtransaction udapp_runTxs" data-id="runtransaction" title={enableRunButton ? 'No scenario file selected' : ''} disabled={enableRunButton} onClick={handleClickRunButton}>Run</button>
        </OverlayTrigger>
        </div>
      </div>
    </div>
  )
}
