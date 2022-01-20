import React from 'react' // eslint-disable-line
import helper from 'apps/remix-ide/src/lib/helper'

const remixLib = require('@remix-project/remix-lib')
const typeConversion = remixLib.execution.typeConversion

const Context = ({ opts, provider }: { opts, provider: string }) => {
  const data = opts.tx || ''
  const from = opts.from ? helper.shortenHexData(opts.from) : ''
  let to = opts.to
  if (data.to) to = to + ' ' + helper.shortenHexData(data.to)
  const val = data.value
  let hash = data.hash ? helper.shortenHexData(data.hash) : ''
  const input = data.input ? helper.shortenHexData(data.input) : ''
  const logs = opts.logs && opts.logs.decoded && opts.logs.decoded.length ? opts.logs.decoded.length : 0
  const block = data.receipt ? data.receipt.blockNumber : data.blockNumber || ''
  const i = data.receipt ? data.transactionIndex : data.transactionIndex
  const value = val ? typeConversion.toInt(val) : 0

  if (provider === 'vm') {
    return (
      <div>
        <span>
          <span className='remix_ui_terminal_tx'>[vm]</span>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>from:</span> {from}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>to:</span> {to}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>value:</span> {value} wei</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>data:</span> {input}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>logs:</span> {logs}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  } else if (provider !== 'vm' && data.resolvedData) {
    return (
      <div>
        <span>
          <span className='remix_ui_terminal_tx'>[block:{block} txIndex:{i}]</span>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>from:</span> {from}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>to:</span> {to}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>value:</span> {value} wei</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>data:</span> {input}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>logs:</span> {logs}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  } else {
    hash = helper.shortenHexData(data.blockHash)
    return (
      <div>
        <span>
          <span className='remix_ui_terminal_tx'>[block:{block} txIndex:{i}]</span>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>from:</span> {from}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>to:</span> {to}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>value:</span> {value} wei</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>data:</span> {input}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>logs:</span> {logs}</div>
          <div className='remix_ui_terminal_txItem'><span className='remix_ui_terminal_txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  }
}

export default Context
