import React from 'react' // eslint-disable-line
import helper from 'apps/remix-ide/src/lib/helper'

const remixLib = require('@remix-project/remix-lib')
var typeConversion = remixLib.execution.typeConversion

const Context = ({ opts, blockchain }) => {
  const data = opts.tx || ''
  const from = opts.from ? helper.shortenHexData(opts.from) : ''
  let to = opts.to
  if (data.to) to = to + ' ' + helper.shortenHexData(data.to)
  const val = data.value
  let hash = data.hash ? helper.shortenHexData(data.hash) : ''
  const input = data.input ? helper.shortenHexData(data.input) : ''
  const logs = data.logs && data.logs.decoded && data.logs.decoded.length ? data.logs.decoded.length : 0
  const block = data.receipt ? data.receipt.blockNumber : data.blockNumber || ''
  const i = data.receipt ? data.transactionIndex : data.transactionIndex
  const value = val ? typeConversion.toInt(val) : 0
  if (blockchain.getProvider() === 'vm') {
    return (
      <div>
        <span className='txLog_7Xiho'>
          <span className='tx'>[vm]</span>
          <div className='txItem'><span className='txItemTitle'>from:</span> {from}</div>
          <div className='txItem'><span className='txItemTitle'>to:</span> {to}</div>
          <div className='txItem'><span className='txItemTitle'>value:</span> {value} wei</div>
          <div className='txItem'><span className='txItemTitle'>data:</span> {input}</div>
          <div className='txItem'><span className='txItemTitle'>logs:</span> {logs}</div>
          <div className='txItem'><span className='txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  } else if (blockchain.getProvider() !== 'vm' && data.resolvedData) {
    return (
      <div>
        <span className='txLog_7Xiho'>
          <span className='tx'>[block:{block} txIndex:{i}]</span>
          <div className='txItem'><span className='txItemTitle'>from:</span> {from}</div>
          <div className='txItem'><span className='txItemTitle'>to:</span> {to}</div>
          <div className='txItem'><span className='txItemTitle'>value:</span> {value} wei</div>
          <div className='txItem'><span className='txItemTitle'>data:</span> {input}</div>
          <div className='txItem'><span className='txItemTitle'>logs:</span> {logs}</div>
          <div className='txItem'><span className='txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  } else {
    hash = helper.shortenHexData(data.blockHash)
    return (
      <div>
        <span className='txLog'>
          <span className='tx'>[block:{block} txIndex:{i}]</span>
          <div className='txItem'><span className='txItemTitle'>from:</span> {from}</div>
          <div className='txItem'><span className='txItemTitle'>to:</span> {to}</div>
          <div className='txItem'><span className='txItemTitle'>value:</span> {value} wei</div>
          <div className='txItem'><span className='txItemTitle'>data:</span> {input}</div>
          <div className='txItem'><span className='txItemTitle'>logs:</span> {logs}</div>
          <div className='txItem'><span className='txItemTitle'>hash:</span> {hash}</div>
        </span>
      </div>)
  }
}

export default Context
