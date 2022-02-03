import React, { useState } from 'react'  // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import helper from 'apps/remix-ide/src/lib/helper'
import CheckTxStatus from './ChechTxStatus' // eslint-disable-line
import showTable from './Table'

const remixLib = require('@remix-project/remix-lib')
const typeConversion = remixLib.execution.typeConversion

const RenderCall = ({ tx, resolvedData, logs, index, plugin, showTableHash, txDetails, modal }) => {
  const to = resolvedData.contractName + '.' + resolvedData.fn
  const from = tx.from ? tx.from : ' - '
  const input = tx.input ? helper.shortenHexData(tx.input) : ''
  const txType = 'call'

  const debug = (event, tx) => {
    event.stopPropagation()
    if (tx.isCall && tx.envMode !== 'vm') {
      modal('VM mode', 'Cannot debug this call. Debugging calls is only possible in JavaScript VM mode.', 'Ok', true, () => {}, 'Cancel', () => {})
    } else {
      plugin.event.trigger('debuggingRequested', [tx.hash])
    }
  }

  return (
    <span id={`tx${tx.hash}`} key={index}>
      <div className="remix_ui_terminal_log" onClick={(event) => txDetails(event, tx)}>
        <CheckTxStatus tx={tx} type={txType} />
        <span>
          <span className="tx">[call]</span>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>from:</span> {from}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>to:</span> {to}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>data:</span> {input}</div>
        </span>
        <div className='remix_ui_terminal_buttons'>
          <div className="remix_ui_terminal_debug btn btn-primary btn-sm" onClick={(event) => debug(event, tx)}>Debug</div>
        </div>
        <i className="remix_ui_terminal_terminal_arrow fas fa-angle-down"></i>
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

export default RenderCall
