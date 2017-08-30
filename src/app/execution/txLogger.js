'use strict'
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager
var helper = require('../../lib/helper')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

/**
  * This just export a function that register to `newTransaction` and forward them to the logger.
  * Emit debugRequested
  *
  */
class TxLogger {
  constructor (opts = {}) {
    this.event = new EventManager()
    this.opts = opts
    opts.api.editorpanel.registerLogType('knownTransaction', (data) => {
      return renderKnownTransaction(this, data)
    })
    opts.api.editorpanel.registerLogType('unknownTransaction', (data) => {
      return renderUnknownTransaction(this, data)
    })
    opts.events.txListener.register('newTransaction', (tx) => {
      log(this, tx, opts.api)
    })
  }
}

function log (self, tx, api) {
  var resolvedTransaction = api.resolvedTransaction(tx.hash)
  if (resolvedTransaction) {
    api.parseLogs(tx, resolvedTransaction.contractName, api.compiledContracts(), (error, logs) => {
      if (!error) {
        api.editorpanel.log({type: 'knownTransaction', value: { tx: tx, resolvedData: resolvedTransaction, logs: logs }})
      }
    })
  } else {
    // contract unknown - just displaying raw tx.
    api.editorpanel.log({ type: 'unknownTransaction', value: { tx: tx } })
  }
}

function renderKnownTransaction (self, data) {
  var to = data.tx.to
  if (to) to = helper.shortenAddress(data.tx.to)
  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  function detail () {
    // @TODO here should open a modal containing some info (e.g input params, logs, ...)
  }
  return yo`<span id="tx${data.tx.hash}">${context(self, data.tx)}: from:${helper.shortenAddress(data.tx.from)}, to:${to}, ${data.resolvedData.contractName}.${data.resolvedData.fn}, value:${value(data.tx.value)} wei, data:${helper.shortenHexData(data.tx.input)}, ${data.logs.length} logs, hash:${helper.shortenHexData((data.tx.hash))},<button onclick=${detail}>Details</button> <button onclick=${debug}>Debug</button></span>`
}

function renderUnknownTransaction (self, data) {
  var to = data.tx.to
  if (to) to = helper.shortenAddress(data.tx.to)
  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  function detail () {
    // @TODO here should open a modal containing some info (e.g input params, logs, ...)
  }
  return yo`<span id="tx${data.tx.hash}">${context(self, data.tx)}: from:${helper.shortenAddress(data.tx.from)}, to:${to}, value:${value(data.tx.value)} wei, data:${helper.shortenHexData((data.tx.input))}, hash:${helper.shortenHexData((data.tx.hash))}, <button onclick=${detail}>Details</button> <button onclick=${debug}>Debug</button></span>`
}

function context (self, tx) {
  if (self.opts.api.context() === 'vm') {
    return yo`<span>(vm)</span>`
  } else {
    return yo`<span>block:${tx.blockNumber}, txIndex:${tx.transactionIndex}`
  }
}

function value (v) {
  try {
    if (v.indexOf && v.indexOf('0x') === 0) {
      return (new BN(v.replace('0x', ''), 16)).toString(10)
    } else {
      return v.toString(10)
    }
  } catch (e) {
    console.log(e)
    return v
  }
}

module.exports = TxLogger
