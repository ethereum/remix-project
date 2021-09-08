import React, { useState } from 'react'  // eslint-disable-line

import helper from 'apps/remix-ide/src/lib/helper'
import checkTxStatus from './ChechTxStatus'
import showTable from './Table'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line

const remixLib = require('@remix-project/remix-lib')
var typeConversion = remixLib.execution.typeConversion

const renderCall = (tx, resolvedData, logs, index, props, showTableHash, txDetails) => {
  const to = resolvedData.contractName + '.' + resolvedData.fn
  const from = tx.from ? tx.from : ' - '
  const input = tx.input ? helper.shortenHexData(tx.input) : ''
  const txType = 'call'

  const debug = (event, tx) => {
    event.stopPropagation()
    if (tx.isCall && tx.envMode !== 'vm') {
      return (<ModalDialog
        hide={false}
        handleHide={() => {} }
        message="Cannot debug this call. Debugging calls is only possible in JavaScript VM mode."
      />)
    } else {
      props.event.trigger('debuggingRequested', [tx.hash])
    }
  }

  return (
    <span id={`tx${tx.hash}`} key={index}>
      <div className="log" onClick={(event) => txDetails(event, tx)}>
        {checkTxStatus(tx, txType)}
        <span className="txLog">
          <span className="tx">[call]</span>
          <div className='txItem'><span className='txItemTitle'>from:</span> {from}</div>
          <div className='txItem'><span className='txItemTitle'>to:</span> {to}</div>
          <div className='txItem'><span className='txItemTitle'>data:</span> {input}</div>
        </span>
        <div className='buttons'>
          <div className="debug btn btn-primary btn-sm" onClick={(event) => debug(event, tx)}>Debug</div>
        </div>
        <i className="arrow fas fa-angle-down"></i>
      </div>
      {showTableHash.includes(tx.hash) ? showTable({
        hash: tx.hash,
        isCall: tx.isCall,
        contractAddress: tx.contractAddress,
        data: tx,
        from,
        to,
        gas: tx.gas,
        input: tx.input,
        'decoded input': resolvedData && resolvedData.params ? JSON.stringify(typeConversion.stringify(resolvedData.params), null, '\t') : ' - ',
        'decoded output': resolvedData && resolvedData.decodedReturnValue ? JSON.stringify(typeConversion.stringify(resolvedData.decodedReturnValue), null, '\t') : ' - ',
        val: tx.value,
        logs: logs,
        transactionCost: tx.transactionCost,
        executionCost: tx.executionCost
      }, showTableHash) : null}
    </span>
  )
}

export default renderCall
