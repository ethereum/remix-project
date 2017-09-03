'use strict'
var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var EventManager = remix.lib.EventManager
var helper = require('../../lib/helper')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var executionContext = require('../../execution-context')

var css = csjs`
  .log {
    display: flex;
    align-items: baseline;
  }
  .txTable, .tr, .td {
    border: 1px solid ${styles.colors.orange};
    background-color: ${styles.colors.veryLightGrey};
    border-collapse: collapse;
    font-size: 10px;
    color: ${styles.colors.grey};
  }
  #txTable {
    width: 450px;
    margin-top: 10px;
    align-self: center;
  }
  .tr, .td {
    padding: 4px;
  }
  .buttons {
    display: flex;
  }
  .debug, .details {
    ${styles.button}
    min-height: 18px;
    max-height: 18px;
    width: 45px;
    min-width: 45px;
    font-size: 10px;
    margin-left: 5px;
  }
  .debug {
    background-color: ${styles.colors.lightOrange};
  }
  .details {
    background-color: ${styles.colors.lightGrey};
  }
`
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
    this.logEmptyBlock = opts.api.editorpanel.registerCommand('emptyBlock', (args, cmds, append) => {
      var data = args[0]
      var el = renderEmptyBlock(this, data)
      append(el)
    })

    opts.events.txListener.register('newBlock', (block) => {
      if (!block.transactions.length) {
        this.logEmptyBlock({ block: block })
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
  var from = helper.shortenAddress(data.tx.from)
  var to = ''

  if (data.tx.blockHash) {
    to = helper.shortenAddress(data.tx.to)
  } else if (data.tx.hash) {  // call (constructor of function call)
    var name = data.resolvedData.contractName + '.' + data.resolvedData.fn
    var logs = ',' + ' 0 logs'
    if (data.resolvedData.fn === '(constructor)') {
      to = name + logs
      from = from + ' ' + name + logs
    } else {
      var toHash = helper.shortenAddress(data.resolvedData.to)
      to = name + ' ' + toHash + logs
      from = from + ' ' + name + logs
    }
  }

  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  var tx = yo`
    <span class=${css.container} id="tx${data.tx.hash}">
      <div class="${css.log}">
        ${context(self, data.tx)}, ${data.resolvedData.contractName}.${data.resolvedData.fn}, ${data.logs.length} logs
        <div class=${css.buttons}>
          <button class=${css.details} onclick=${detail}>Details</button>
          <button class=${css.debug} onclick=${debug}>Debug</button>
        </div>
      </div>
    </span>
  `
  function detail () {
    var table = yo`
      <table class="${css.txTable}" id="txTable">
        <tr class="${css.tr}">
          <td class="${css.td}">from</td>
          <td class="${css.td}">${from}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">to:</td>
          <td class="${css.td}">${to}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">value:</td>
          <td class="${css.td}">${value(data.tx.value)} wei</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">data:</td>
          <td class="${css.td}">${helper.shortenHexData(data.tx.input)}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">hash:</td>
          <td class="${css.td}">${helper.shortenHexData((data.tx.hash))}</td>
        </tr class="${css.tr}">
      </table>
    `
    tx.appendChild(table)
  }
  return tx
}

function renderUnknownTransaction (self, data) {
  var from = helper.shortenAddress(data.tx.from)
  var to = data.tx.to
  if (to) to = helper.shortenAddress(data.tx.to)
  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  var tx = yo`
    <span class=${css.container} id="tx${data.tx.hash}">
      <div class="${css.log}">
        ${context(self, data.tx)}
        <div class=${css.buttons}>
          <button class=${css.details} onclick=${detail}>Details</button>
          <button class=${css.debug} onclick=${debug}>Debug</button>
        </div>
      </div>
    </span>
  `
  function detail () {
    var table = yo`
      <table class="${css.txTable}" id="txTable">
        <tr class="${css.tr}">
          <td class="${css.td}">from</td>
          <td class="${css.td}">${from}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">to:</td>
          <td class="${css.td}">${to}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">value:</td>
          <td class="${css.td}">${value(data.tx.value)} wei</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">data:</td>
          <td class="${css.td}">${helper.shortenHexData(data.tx.input)}</td>
        </tr class="${css.tr}">
        <tr class="${css.tr}">
          <td class="${css.td}">hash:</td>
          <td class="${css.td}">${helper.shortenHexData((data.tx.hash))}</td>
        </tr class="${css.tr}">
      </table>
    `
    tx.appendChild(table)
  }
  return tx
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
