'use strict'
var yo = require('yo-yo')
const copy = require('clipboard-copy')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var EventManager = remix.lib.EventManager
var helper = require('../../lib/helper')
var executionContext = require('../../execution-context')
var modalDialog = require('../ui/modal-dialog-custom')
var typeConversion = require('../../lib/typeConversion')

var css = csjs`
  .log {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .tx {
    color: ${styles.colors.violet};
    width: 45%;
  }
  .txTable, .tr, .td {
    border-collapse: collapse;
    font-size: 10px;
    color: ${styles.colors.grey};
    border: 1px dashed ${styles.colors.black};
  }
  #txTable {
    margin-top: 1%;
    margin-bottom: 5%;
    align-self: center;
  }
  .tr, .td {
    padding: 4px;
  }
  .tableTitle {
    width: 25%;
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
  .clipboardCopy {
    margin-right: 0.5em;
    cursor: pointer;
  }`
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
      var el
      if (data.tx.isCall) {
        el = renderCall(this, data)
      } else {
        el = renderKnownTransaction(this, data)
      }
      append(el)
    }, { activate: true })

    this.logUnknownTX = opts.api.editorpanel.registerCommand('unknownTransaction', (args, cmds, append) => {
      var data = args[0]
      var el = renderUnknownTransaction(this, data)
      append(el)
    }, { activate: false })

    this.logEmptyBlock = opts.api.editorpanel.registerCommand('emptyBlock', (args, cmds, append) => {
      var data = args[0]
      var el = renderEmptyBlock(this, data)
      append(el)
    }, { activate: true })

    opts.api.editorpanel.event.register('terminalFilterChanged', (type, label) => {
      if (type === 'deselect') {
        if (label === 'only remix transactions') {
          opts.api.editorpanel.updateTerminalFilter({ type: 'select', value: 'unknownTransaction' })
        } else if (label === 'all transactions') {
          opts.api.editorpanel.updateTerminalFilter({ type: 'deselect', value: 'unknownTransaction' })
        }
      } else if (type === 'select') {
        if (label === 'only remix transactions') {
          opts.api.editorpanel.updateTerminalFilter({ type: 'deselect', value: 'unknownTransaction' })
        } else if (label === 'all transactions') {
          opts.api.editorpanel.updateTerminalFilter({ type: 'select', value: 'unknownTransaction' })
        }
      }
    })

    opts.events.txListener.register('newBlock', (block) => {
      if (!block.transactions.length) {
        this.logEmptyBlock({ block: block })
      }
    })

    opts.events.txListener.register('newTransaction', (tx) => {
      log(this, tx, opts.api)
    })

    opts.events.txListener.register('newCall', (tx) => {
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
  var from = data.tx.from
  var to = data.resolvedData.contractName + '.' + data.resolvedData.fn
  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}">
        ${context(self, {from, to, data})}
        <div class=${css.buttons}>
        <button class=${css.details} onclick=${txDetails}>Details</button>
        <button class=${css.debug} onclick=${debug}>Debug</button>
        </div>
      </div>
    </span>
  `

  var table
  function txDetails () {
    if (table && table.parentNode) {
      tx.removeChild(table)
    } else {
      table = createTable({
        contractAddress: data.tx.contractAddress,
        data: data.tx,
        from,
        to,
        gas: data.tx.gas,
        hash: data.tx.hash,
        input: data.tx.input,
        'decoded input': data.resolvedData && data.resolvedData.params ? JSON.stringify(typeConversion.stringify(data.resolvedData.params), null, '\t') : ' - ',
        'decoded output': data.resolvedData && data.resolvedData.decodedReturnValue ? JSON.stringify(typeConversion.stringify(data.resolvedData.decodedReturnValue), null, '\t') : ' - ',
        logs: data.logs,
        val: data.tx.value
      })
      tx.appendChild(table)
    }
  }

  return tx
}

function renderCall (self, data) {
  function debug () {
    if (data.tx.envMode === 'vm') {
      self.event.trigger('debugRequested', [data.tx.hash])
    } else {
      modalDialog.alert('Cannot debug this call. Debugging calls is only possible in JavaScript VM mode.')
    }
  }
  var to = data.resolvedData.contractName + '.' + data.resolvedData.fn + ' ' + helper.shortenHexData(data.tx.to)
  var from = data.tx.from ? data.tx.from : ' - '
  var input = data.tx.input ? helper.shortenHexData(data.tx.input) : ''
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}">
        <span><span class=${css.tx}>[call]</span> from:${from}, to:${to}, data:${input}, return: </span>
        <div class=${css.buttons}>
          <button class=${css.debug} onclick=${debug}>Debug</button>
        </div>
      </div>
      <div> ${JSON.stringify(typeConversion.stringify(data.resolvedData.decodedReturnValue), null, '\t')}</div>
    </span>
  `
  return tx
}

function renderUnknownTransaction (self, data) {
  var from = data.tx.from
  var to = data.tx.to
  function debug () {
    self.event.trigger('debugRequested', [data.tx.hash])
  }
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}">
        ${context(self, {from, to, data})}
        <div class=${css.buttons}>
          <button class=${css.details} onclick=${txDetails}>Details</button>
          <button class=${css.debug} onclick=${debug}>Debug</button>
        </div>
      </div>
    </span>
  `
  var table
  function txDetails () {
    if (table && table.parentNode) {
      tx.removeChild(table)
    } else {
      table = createTable({
        data: data.tx,
        from,
        to,
        val: data.tx.value,
        input: data.tx.input,
        hash: data.tx.hash,
        gas: data.tx.gas,
        logs: data.logs
      })
      tx.appendChild(table)
    }
  }
  return tx
}

function renderEmptyBlock (self, data) {
  return yo`<span><span class='${css.tx}'>[block:${data.block.number} - 0 transactions]</span></span>`
}

function context (self, opts) {
  var data = opts.data || ''
  var from = opts.from ? helper.shortenHexData(opts.from) : ''
  var to = opts.to
  if (data.tx.to) to = to + ' ' + helper.shortenHexData(data.tx.to)
  var val = data.tx.value
  var hash = data.tx.hash ? helper.shortenHexData(data.tx.hash) : ''
  var input = data.tx.input ? helper.shortenHexData(data.tx.input) : ''
  var logs = data.logs && data.logs.decoded ? data.logs.decoded.length : 0
  var block = data.tx.blockNumber || ''
  var i = data.tx.transactionIndex
  if (executionContext.getProvider() === 'vm') {
    return yo`<span><span class=${css.tx}>[vm]</span> from:${from}, to:${to}, value:${typeConversion.hexToInt(val)} wei, data:${input}, ${logs} logs, hash:${hash}</span>`
  } else if (executionContext.getProvider() !== 'vm' && data.resolvedData) {
    return yo`<span><span class='${css.tx}'>[block:${block} txIndex:${i}]</span> from:${from}, to:${to}, value:${typeConversion.hexToInt(val)} wei, ${logs} logs, data:${input}, hash:${hash}</span>`
  } else {
    to = helper.shortenHexData(to)
    hash = helper.shortenHexData(data.tx.blockHash)
    return yo`<span><span class='${css.tx}'>[block:${block} txIndex:${i}]</span> from:${from}, to:${to}, value:${typeConversion.hexToInt(val)} wei</span>`
  }
}

module.exports = TxLogger

// helpers

function createTable (opts) {
  var table = yo`<table class="${css.txTable}" id="txTable"></table>`

  var contractAddress = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> contractAddress </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.contractAddress) }} title='Copy to clipboard'></i>${opts.contractAddress}</td>
    </tr class="${css.tr}">
  `
  if (opts.contractAddress) table.appendChild(contractAddress)

  var from = yo`
    <tr class="${css.tr}">
      <td class="${css.td} ${css.tableTitle}"> from </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.from) }} title='Copy to clipboard'></i>${opts.from}</td>
    </tr class="${css.tr}">
  `
  if (opts.from) table.appendChild(from)

  var toHash
  var data = opts.data  // opts.data = data.tx
  if (data.to) {
    toHash = opts.to + ' ' + data.to
  } else {
    toHash = opts.to
  }
  var to = yo`
    <tr class="${css.tr}">
    <td class="${css.td}"> to </td>
    <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.toHash) }} title='Copy to clipboard'></i>${toHash}</td>
    </tr class="${css.tr}">
  `
  if (opts.to) table.appendChild(to)

  var gas = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> gas </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.gas) }} title='Copy to clipboard'></i>${opts.gas}</td>
    </tr class="${css.tr}">
  `
  if (opts.gas) table.appendChild(gas)

  var hash = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> hash </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.hash) }} title='Copy to clipboard'></i>${opts.hash}</td>
    </tr class="${css.tr}">
  `
  if (opts.hash) table.appendChild(hash)

  var input = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> input </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts.input) }} title='Copy to clipboard'></i>${opts.input}</td>
    </tr class="${css.tr}">
  `
  if (opts.input) table.appendChild(input)

  if (opts['decoded input']) {
    var inputDecoded = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> decoded input </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(opts['decoded input']) }} title='Copy to clipboard'></i>${opts['decoded input']}</td>
    </tr class="${css.tr}">`
    table.appendChild(inputDecoded)
  }

  if (opts['decoded output']) {
    var outputDecoded = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> decoded output </td>
      <td class="${css.td}" id="decodedoutput" >${opts['decoded output']}</td>
    </tr class="${css.tr}">`
    table.appendChild(outputDecoded)
  }

  var stringified = ' - '
  if (opts.logs.decoded) {
    stringified = typeConversion.stringify(opts.logs.decoded)
  }
  var logs = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> logs </td>
      <td class="${css.td}">
      <i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(JSON.stringify(stringified, null, '\t')) }} title='Copy Logs to clipboard'></i>
      <i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(JSON.stringify(opts.logs.raw || '0')) }} title='Copy Raw Logs to clipboard'></i>${JSON.stringify(stringified, null, '\t')}</td>
    </tr class="${css.tr}">
  `
  if (opts.logs) table.appendChild(logs)

  var val = typeConversion.hexToInt(opts.val)
  val = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> value </td>
      <td class="${css.td}"><i class="fa fa-clipboard ${css.clipboardCopy}" aria-hidden="true" onclick=${function () { copy(`${val} wei`) }} title='Copy to clipboard'></i>${val} wei</td>
    </tr class="${css.tr}">
  `
  if (opts.val) table.appendChild(val)

  return table
}
