import React, { useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog'// eslint-disable-line
import CheckTxStatus from './ChechTxStatus' // eslint-disable-line
import Context from './Context' // eslint-disable-line
import showTable from './Table'

const RenderUnKnownTransactions = ({ tx, receipt, index, plugin, showTableHash, txDetails }) => {
  const debug = (event, tx) => {
    event.stopPropagation()
    if (tx.isCall && tx.envMode !== 'vm') {
      return (<ModalDialog
        hide={false}
        handleHide={() => {} }
        message="Cannot debug this call. Debugging calls is only possible in JavaScript VM mode."
      />)
    } else {
      plugin.event.trigger('debuggingRequested', [tx.hash])
    }
  }

  const from = tx.from
  const to = tx.to
  // const obj = { from, to }
  const txType = 'unknown' + (tx.isCall ? 'Call' : 'Tx')
  const options = { from, to, tx }
  return (
    <span id={`tx${tx.hash}`} key={index}>
      <div className="log" onClick={(event) => txDetails(event, tx)}>
        <CheckTxStatus tx={receipt || tx} type={txType} />
        <Context opts = { options } blockchain={plugin.blockchain} />
        <div className='buttons'>
          <div className='debug btn btn-primary btn-sm' data-shared='txLoggerDebugButton' data-id={`txLoggerDebugButton${tx.hash}`} onClick={(event) => debug(event, tx)}>Debug</div>
        </div>
        <i className = {`arrow fas ${(showTableHash.includes(tx.hash)) ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
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
        'decoded output': ' - ',
        val: tx.value,
        transactionCost: tx.transactionCost,
        executionCost: tx.executionCost
      }, showTableHash) : null}
    </span>
  )
}

export default RenderUnKnownTransactions
