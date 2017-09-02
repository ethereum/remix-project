'use strict'
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager
var helper = require('../../lib/helper')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var executionContext = require('../../execution-context')

/**
  * This just export a function that register to `newTransaction` and forward them to the logger.
  * Emit debugRequested
  *
  */
class TxLogger {
  constructor (opts = {}) {
    this.event = new EventManager()
    this.opts = opts
    this.logKnownTX = opts.api.editorpanel.registerCommand('knownTransaction', (args, cmds, append) => {
      var data = args[0]
      var el = renderKnownTransaction(this, data)
      append(el)
    })
    this.logUnknownTX = opts.api.editorpanel.registerCommand('unknownTransaction', (args, cmds, append) => {
      var data = args[0]
      var el = renderUnknownTransaction(this, data)
      append(el)
    })
    opts.api.editorpanel.registerLogType('emptyBlock', (data) => {
      return renderEmptyBlock(this, data)
    })

    opts.events.txListener.register('newBlock', (block) => {
      if (!block.transactions.length) {
        opts.api.editorpanel.log({type: 'emptyBlock', value: { block: block }})
      }
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
        self.logKnownTX({ tx: tx, resolvedData: resolvedTransaction, logs: logs })
      }
    })
  } else {
    // contract unknown - just displaying raw tx.
    self.logUnknownTX({ tx: tx })
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

function renderEmptyBlock (self, data) {
  return yo`<span>block ${data.block.number} - O transactions</span>`
}

function context (self, tx) {
  if (executionContext.getProvider() === 'vm') {
    return yo`<span>(vm)</span>`
  } else {
    return yo`<span>block:${tx.blockNumber}, txIndex:${tx.transactionIndex}</span>`
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
