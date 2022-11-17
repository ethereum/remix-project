// eslint-disable-next-line no-use-before-define
import React, {useRef, useState, useEffect} from 'react'
import { FormattedMessage } from 'react-intl'
import { RecorderProps } from '../types'
import { CustomTooltip } from '@remix-ui/helper'

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
          <label className="mt-1 udapp_recorderSectionLabel">
            <FormattedMessage id='udapp.transactionsRecorded' defaultMessage='Transactions recorded' />
          </label>
          <CustomTooltip
            placement={'right'}
            tooltipClasses="text-nowrap"
            tooltipId="recordedTransactionsCounttooltip"
            tooltipText={'The number of recorded transactions'}
          >
          <div className="ml-2 badge badge-pill badge-primary text-center" data-title="The number of recorded transactions">{props.count}</div>
        </CustomTooltip>
        <CustomTooltip
          placement={'right'}
          tooltipClasses="text-wrap"
          tooltipId="info-recorder"
          tooltipText={<span>Save transactions (deployed contracts and function executions) <br />and replay them in another environment e.g Transactions created <br />in Remix VM can be replayed in the Injected Provider.</span>}
          >
          <i style={{ fontSize: 'medium' }} className={'ml-2 fal fa-info-circle align-self-center'} aria-hidden="true"></i>
        </CustomTooltip>
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
          <CustomTooltip
            placement={'right'}
            tooltipClasses="text-wrap"
            tooltipId="tooltip-livemode-recorder"
            tooltipText="If contracts are updated after recording transactions, checking this box will run recorded transactions with the latest copy of the compiled contracts"
          >
            <label className="form-check-label custom-control-label" data-id="runtabLivemodeInput" htmlFor="livemode-recorder">Run transactions using the latest compilation result</label>
          </CustomTooltip>
        </div>
        <div className="mb-1 mt-1 udapp_transactionActions">
        <CustomTooltip
          placement={'bottom-start'}
          tooltipClasses="text-nowrap"
          tooltipId="remixUdappTransactionSavetooltip"
          tooltipText={
                props.count === 0 ? 'No transactions to save'
                :  props.count === 1 ? `Save ${props.count} transaction as scenario file`
                : `Save ${props.count} transactions as scenario file`
              }
        >
          <span>
            <button className="btn btn-sm btn-info savetransaction udapp_recorder" disabled={props.count === 0 ? true: false} onClick={triggerRecordButton} style={{ pointerEvents: props.count === 0 ? 'none' : 'auto' }}>
              Save
            </button>
          </span>
        </CustomTooltip>
        <CustomTooltip
          placement={'right'}
          tooltipClasses="text-nowrap"
          tooltipId="tooltip-run-recorder"
          tooltipText="Run transaction(s) from the current scenario file"
        >
          <span>
            <button className="btn btn-sm btn-info runtransaction udapp_runTxs" data-id="runtransaction" disabled={enableRunButton} onClick={handleClickRunButton} style={{ pointerEvents: enableRunButton ? 'none' : 'auto' }}>
              Run
            </button>
          </span>
        </CustomTooltip>
        </div>
      </div>
    </div>
  )
}
