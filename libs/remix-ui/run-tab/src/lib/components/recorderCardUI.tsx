// eslint-disable-next-line no-use-before-define
import React, {useState} from 'react'
import { RecorderProps } from '../types'

export function RecorderUI (props: RecorderProps) {
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)
  const triggerRecordButton = () => {
    props.storeScenario(props.scenarioPrompt)
  }

  const handleClickRunButton = () => {
    props.runCurrentScenario(props.gasEstimationPrompt, props.passphrasePrompt, props.mainnetPrompt)
  }

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  return (
    <div className="udapp_cardContainer list-group-item border border-bottom">
      <div className="udapp_recorderSection d-flex justify-content-between" onClick={toggleClass}>
        <div className="d-flex">
          <label className="mt-1 udapp_recorderSectionLabel">Transactions recorded</label>
          <div className="ml-2 mb-2 badge badge-pill badge-primary" title="The number of recorded transactions">{props.count}</div>
        </div>
        <div>
          <span data-id='udappRecorderTitleExpander' onClick={toggleClass}>
            <i className={!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down'} aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div className={`border-bottom flex-column ${toggleExpander ? "d-flex" : "d-none"}`}>
        <div className="p-2 mt-2">
          All transactions (deployed contracts and function executions) can be saved and replayed in
          another environment. e.g Transactions created in Javascript VM can be replayed in the Injected Web3.
        </div>
        <div className="mb-2 udapp_transactionActions">
          <i className="fas fa-save savetransaction udapp_recorder udapp_icon"
            onClick={triggerRecordButton} title="Save Transactions" aria-hidden="true">
          </i>
          <i className="fas fa-play runtransaction udapp_runTxs udapp_icon" title="Run Transactions" data-id="runtransaction" aria-hidden="true" onClick={handleClickRunButton}></i>
        </div>
      </div>
    </div>
  )
}
