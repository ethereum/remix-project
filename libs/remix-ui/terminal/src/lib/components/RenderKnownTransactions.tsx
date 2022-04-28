
import React from 'react' // eslint-disable-line
import CheckTxStatus from './ChechTxStatus' // eslint-disable-line
import Context from './Context' // eslint-disable-line
import showTable from './Table'
import { execution } from '@remix-project/remix-lib'
const typeConversion = execution.typeConversion

const RenderKnownTransactions = ({ tx, receipt, resolvedData, logs, index, plugin, showTableHash, txDetails, modal, provider }) => {
  const debug = (event, tx) => {
    event.stopPropagation()
    if (tx.isCall && tx.envMode !== 'vm') {
      modal('VM mode', 'Cannot debug this call. Debugging calls is only possible in JavaScript VM mode.', 'Ok', true, () => {}, 'Cancel', () => {})
    } else {
      plugin.event.trigger('debuggingRequested', [tx.hash])
    }
  }

  const from = tx.from
  const to = resolvedData.contractName + '.' + resolvedData.fn
  const txType = 'knownTx'
  const options = { from, to, tx, logs }
  return (
    <span id={`tx${tx.hash}`} key={index}>
      <div className="remix_ui_terminal_log" onClick={(event) => txDetails(event, tx)}>
        <CheckTxStatus tx={receipt} type={txType} />
        <Context opts = { options } provider={provider} />
        <div className='remix_ui_terminal_buttons'>
          <div
            className='remix_ui_terminal_debug btn btn-primary btn-sm'
            data-shared='txLoggerDebugButton'
            data-id={`txLoggerDebugButton${tx.hash}`}
            onClick={(event) => debug(event, tx)}
          >Debug</div>
        </div>
        <i className={`remix_ui_terminal_arrow fas ${(showTableHash.includes(tx.hash)) ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
      </div>
      {showTableHash.includes(tx.hash) ? showTable({
        hash: tx.hash,
        status: receipt !== null ? receipt.status : null,
        isCall: tx.isCall,
        contractAddress: tx.contractAddress,
        data: tx,
        from,
        to,
        gas: tx.gas,
        input: tx.input,
        'decoded input': resolvedData && resolvedData.params ? JSON.stringify(typeConversion.stringify(resolvedData.params), null, '\t') : ' - ',
        'decoded output': resolvedData && resolvedData.decodedReturnValue ? JSON.stringify(typeConversion.stringify(resolvedData.decodedReturnValue), null, '\t') : ' - ',
        logs: logs,
        val: tx.value,
        transactionCost: tx.transactionCost,
        executionCost: tx.executionCost
      }, showTableHash) : null}
    </span>
  )
}

export default RenderKnownTransactions
