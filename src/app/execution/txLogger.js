'use strict'
var yo = require('yo-yo')
var copyToClipboard = require('../ui/copy-to-clipboard')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = require('../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var EventManager = remixLib.EventManager
var helper = require('../../lib/helper')
var executionContext = require('../../execution-context')
var modalDialog = require('../ui/modal-dialog-custom')
var typeConversion = remixLib.execution.typeConversion
var globlalRegistry = require('../../global/registry')

var css = csjs`
  .log {
    display: flex;
    cursor: pointer;
    align-items: center;
    cursor: pointer;
  }
  .log:hover {
    opacity: 0.8;
  }
  .arrow {
    color: ${styles.terminal.icon_Color_Menu};
    font-size: 20px;
    cursor: pointer;
    display: flex;
    margin-left: 10px;
  }
  .arrow:hover {
    color: ${styles.terminal.icon_HoverColor_Menu};
  }
  .txLog {
  }
  .txStatus {
    display: flex;
    font-size: 20px;
    margin-right: 20px;
    float: left;
  }
  .succeeded {
    color: ${styles.terminal.icon_Color_Log_Succeed};
  }
  .failed {
    color: ${styles.terminal.icon_Color_Log_Failed};
  }
  .notavailable {
  }
  .call {
    font-size: 7px;
    background-color: ${styles.terminal.icon_BackgroundColor_Log_Call};
    border-radius: 50%;
    min-width: 20px;
    min-height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${styles.terminal.icon_Color_Log_Call};
    text-transform: uppercase;
    font-weight: bold;
  }
  .txItem {
    color: ${styles.terminal.text_Primary};
    margin-right: 5px;
    float: left;
  }
  .txItemTitle {
    font-weight: bold;
  }
  .tx {
    color: ${styles.terminal.text_Title_TransactionLog};
    font-weight: bold;
    float: left;
    margin-right: 10px;
  }
  .txTable,
  .tr,
  .td {
    border-collapse: collapse;
    font-size: 10px;
    color: ${styles.terminal.text_Primary};
    border: 1px solid ${styles.terminal.text_Secondary};
  }
  #txTable {
    margin-top: 1%;
    margin-bottom: 5%;
    align-self: center;
    width: 85%;
  }
  .tr, .td {
    padding: 4px;
    vertical-align: baseline;
  }
  .td:first-child {
    min-width: 30%;
    width: 30%;
    align-items: baseline;
    font-weight: bold;
  }
  .tableTitle {
    width: 25%;
  }
  .buttons {
    display: flex;
    margin-left: auto;
  }
  .debug {
    ${styles.terminal.button_Log_Debug}
    width: 55px;
    min-width: 55px;
    min-height: 20px;
    max-height: 20px;
    font-size: 11px;
  }
  .debug:hover {
    opacity: 0.8;
  }`
/**
  * This just export a function that register to `newTransaction` and forward them to the logger.
  *
  */
class TxLogger {
  constructor (localRegistry) {
    this.event = new EventManager()
    this.seen = {}
    function filterTx (value, query) {
      if (value.length) {
        return helper.find(value, query)
      }
      return false
    }

    this._components = {}
    this._components.registry = localRegistry || globlalRegistry
    // dependencies
    this._deps = {
      editorPanel: this._components.registry.get('editorpanel').api,
      txListener: this._components.registry.get('txlistener').api,
      eventsDecoder: this._components.registry.get('eventsdecoder').api,
      compiler: this._components.registry.get('compiler').api,
      app: this._components.registry.get('app').api
    }

    this.logKnownTX = this._deps.editorPanel.registerCommand('knownTransaction', (args, cmds, append) => {
      var data = args[0]
      var el
      if (data.tx.isCall) {
        el = renderCall(this, data)
      } else {
        el = renderKnownTransaction(this, data)
      }
      this.seen[data.tx.hash] = el
      append(el)
    }, { activate: true, filterFn: filterTx })

    this.logUnknownTX = this._deps.editorPanel.registerCommand('unknownTransaction', (args, cmds, append) => {
      // triggered for transaction AND call
      var data = args[0]
      var el = renderUnknownTransaction(this, data)
      append(el)
    }, { activate: false, filterFn: filterTx })

    this.logEmptyBlock = this._deps.editorPanel.registerCommand('emptyBlock', (args, cmds, append) => {
      var data = args[0]
      var el = renderEmptyBlock(this, data)
      append(el)
    }, { activate: true })

    this._deps.editorPanel.event.register('terminalFilterChanged', (type, label) => {
      if (type === 'deselect') {
        if (label === 'only remix transactions') {
          this._deps.editorPanel.updateTerminalFilter({ type: 'select', value: 'unknownTransaction' })
        } else if (label === 'all transactions') {
          this._deps.editorPanel.updateTerminalFilter({ type: 'deselect', value: 'unknownTransaction' })
        }
      } else if (type === 'select') {
        if (label === 'only remix transactions') {
          this._deps.editorPanel.updateTerminalFilter({ type: 'deselect', value: 'unknownTransaction' })
        } else if (label === 'all transactions') {
          this._deps.editorPanel.updateTerminalFilter({ type: 'select', value: 'unknownTransaction' })
        }
      }
    })

    this._deps.txListener.event.register('newBlock', (block) => {
      if (!block.transactions.length) {
        this.logEmptyBlock({ block: block })
      }
    })

    this._deps.txListener.event.register('newTransaction', (tx, receipt) => {
      log(this, tx, receipt)
    })

    this._deps.txListener.event.register('newCall', (tx) => {
      log(this, tx, null)
    })
  }
}

function debug (e, data, self) {
  e.stopPropagation()
  if (data.tx.isCall && data.tx.envMode !== 'vm') {
    modalDialog.alert('Cannot debug this call. Debugging calls is only possible in JavaScript VM mode.')
  } else {
    self._deps.app.startdebugging(data.tx.hash)
  }
}

function log (self, tx, receipt) {
  var resolvedTransaction = self._deps.txListener.resolvedTransaction(tx.hash)
  if (resolvedTransaction) {
    var compiledContracts = null
    if (self._deps.compiler.lastCompilationResult && self._deps.compiler.lastCompilationResult.data) {
      compiledContracts = self._deps.compiler.lastCompilationResult.data.contracts
    }
    self._deps.eventsDecoder.parseLogs(tx, resolvedTransaction.contractName, compiledContracts, (error, logs) => {
      if (!error) {
        self.logKnownTX({ tx: tx, receipt: receipt, resolvedData: resolvedTransaction, logs: logs })
      }
    })
  } else {
    // contract unknown - just displaying raw tx.
    self.logUnknownTX({ tx: tx, receipt: receipt })
  }
}

function renderKnownTransaction (self, data) {
  var from = data.tx.from
  var to = data.resolvedData.contractName + '.' + data.resolvedData.fn
  var obj = {from, to}
  var txType = 'knownTx'
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}" onclick=${e => txDetails(e, tx, data, obj)}>
        ${checkTxStatus(data.receipt, txType)}
        ${context(self, {from, to, data})}
        <div class=${css.buttons}>
          <div class=${css.debug} onclick=${(e) => debug(e, data, self)}>Debug</div>
        </div>
        <i class="${css.arrow} fa fa-angle-down"></i>
      </div>
    </span>
  `
  return tx
}

function renderCall (self, data) {
  var to = data.resolvedData.contractName + '.' + data.resolvedData.fn
  var from = data.tx.from ? data.tx.from : ' - '
  var input = data.tx.input ? helper.shortenHexData(data.tx.input) : ''
  var obj = {from, to}
  var txType = 'call'
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}" onclick=${e => txDetails(e, tx, data, obj)}>
        ${checkTxStatus(data.tx, txType)}
        <span class=${css.txLog}>
          <span class=${css.tx}>[call]</span>
          <div class=${css.txItem}><span class=${css.txItemTitle}>from:</span> ${from}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>to:</span> ${to}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>data:</span> ${input}</div>
        </span>
        <div class=${css.buttons}>
          <div class=${css.debug} onclick=${(e) => debug(e, data, self)}>Debug</div>
        </div>
        <i class="${css.arrow} fa fa-angle-down"></i>
      </div>
    </span>
  `
  return tx
}

function renderUnknownTransaction (self, data) {
  var from = data.tx.from
  var to = data.tx.to
  var obj = {from, to}
  var txType = 'unknown' + (data.tx.isCall ? 'Call' : 'Tx')
  var tx = yo`
    <span id="tx${data.tx.hash}">
      <div class="${css.log}" onclick=${e => txDetails(e, tx, data, obj)}>
        ${checkTxStatus(data.receipt || data.tx, txType)}
        ${context(self, {from, to, data})}
        <div class=${css.buttons}>
          <div class=${css.debug} onclick=${(e) => debug(e, data, self)}>Debug</div>
        </div>
        <i class="${css.arrow} fa fa-angle-down"></i>
      </div>
    </span>
  `
  return tx
}

function renderEmptyBlock (self, data) {
  return yo`
    <span class=${css.txLog}>
      <span class='${css.tx}'><div class=${css.txItem}>[<span class=${css.txItemTitle}>block:${data.block.number} - </span> 0 transactions]</span></span>
    </span>`
}

function checkTxStatus (tx, type) {
  if (tx.status === '0x1') {
    return yo`<i class="${css.txStatus} ${css.succeeded} fa fa-check-circle"></i>`
  }
  if (type === 'call' || type === 'unknownCall') {
    return yo`<i class="${css.txStatus} ${css.call}">call</i>`
  } else if (tx.status === '0x0') {
    return yo`<i class="${css.txStatus} ${css.failed} fa fa-times-circle"></i>`
  } else {
    return yo`<i class="${css.txStatus} ${css.notavailable} fa fa-circle-thin" title='Status not available' ></i>`
  }
}

function context (self, opts) {
  var data = opts.data || ''
  var from = opts.from ? helper.shortenHexData(opts.from) : ''
  var to = opts.to
  if (data.tx.to) to = to + ' ' + helper.shortenHexData(data.tx.to)
  var val = data.tx.value
  var hash = data.tx.hash ? helper.shortenHexData(data.tx.hash) : ''
  var input = data.tx.input ? helper.shortenHexData(data.tx.input) : ''
  var logs = data.logs && data.logs.decoded && data.logs.decoded.length ? data.logs.decoded.length : 0
  var block = data.tx.blockNumber || ''
  var i = data.tx.transactionIndex
  var value = val ? typeConversion.toInt(val) : 0
  if (executionContext.getProvider() === 'vm') {
    return yo`
      <div>
        <span class=${css.txLog}>
          <span class=${css.tx}>[vm]</span>
          <div class=${css.txItem}><span class=${css.txItemTitle}>from:</span> ${from}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>to:</span> ${to}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>value:</span> ${value} wei</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>data:</span> ${input}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>logs:</span> ${logs}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>hash:</span> ${hash}</div>
        </span>
      </div>`
  } else if (executionContext.getProvider() !== 'vm' && data.resolvedData) {
    return yo`
      <div>
        <span class=${css.txLog}>
          <span class='${css.tx}'>[block:${block} txIndex:${i}]</span>
          <div class=${css.txItem}><span class=${css.txItemTitle}>from:</span> ${from}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>to:</span> ${to}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>value:</span> ${value} wei</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>data:</span> ${input}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>logs:</span> ${logs}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>hash:</span> ${hash}</div>
        </span>
      </div>`
  } else {
    to = helper.shortenHexData(to)
    hash = helper.shortenHexData(data.tx.blockHash)
    return yo`
      <div>
        <span class=${css.txLog}>
          <span class='${css.tx}'>[block:${block} txIndex:${i}]</span>
          <div class=${css.txItem}><span class=${css.txItemTitle}>from:</span> ${from}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>to:</span> ${to}</div>
          <div class=${css.txItem}><span class=${css.txItemTitle}>value:</span> ${value} wei</div>
        </span>
      </div>`
  }
}

module.exports = TxLogger

// helpers

function txDetails (e, tx, data, obj) {
  var table = document.querySelector(`#${tx.id} [class^="txTable"]`)
  var from = obj.from
  var to = obj.to
  var log = document.querySelector(`#${tx.id} [class^='log']`)
  var arrow = document.querySelector(`#${tx.id} [class^='arrow']`)
  var arrowUp = yo`<i class="${css.arrow} fa fa-angle-up"></i>`
  var arrowDown = yo`<i class="${css.arrow} fa fa-angle-down"></i>`
  if (table && table.parentNode) {
    tx.removeChild(table)
    log.removeChild(arrow)
    log.appendChild(arrowDown)
  } else {
    log.removeChild(arrow)
    log.appendChild(arrowUp)
    table = createTable({
      hash: data.tx.hash,
      status: data.receipt ? data.receipt.status : null,
      isCall: data.tx.isCall,
      contractAddress: data.tx.contractAddress,
      data: data.tx,
      from,
      to,
      gas: data.tx.gas,
      input: data.tx.input,
      'decoded input': data.resolvedData && data.resolvedData.params ? JSON.stringify(typeConversion.stringify(data.resolvedData.params), null, '\t') : ' - ',
      'decoded output': data.resolvedData && data.resolvedData.decodedReturnValue ? JSON.stringify(typeConversion.stringify(data.resolvedData.decodedReturnValue), null, '\t') : ' - ',
      logs: data.logs,
      val: data.tx.value,
      transactionCost: data.tx.transactionCost,
      executionCost: data.tx.executionCost
    })
    tx.appendChild(table)
  }
}

function createTable (opts) {
  var table = yo`<table class="${css.txTable}" id="txTable"></table>`
  if (!opts.isCall) {
    var msg = ''
    if (opts.status) {
      if (opts.status === '0x0') {
        msg = ' Transaction mined but execution failed'
      } else if (opts.status === '0x1') {
        msg = ' Transaction mined and execution succeed'
      }
    } else {
      msg = ' Status not available at the moment'
    }
    table.appendChild(yo`
      <tr class="${css.tr}">
        <td class="${css.td}"> status </td>
        <td class="${css.td}">${opts.status}${msg}</td>
      </tr>`)
  }

  var transactionHash = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> transaction hash </td>
      <td class="${css.td}">${opts.hash}
        ${copyToClipboard(() => opts.hash)}
      </td>
    </tr>
  `
  table.appendChild(transactionHash)

  var contractAddress = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> contract address </td>
      <td class="${css.td}">${opts.contractAddress}
        ${copyToClipboard(() => opts.contractAddress)}
      </td>
    </tr>
  `
  if (opts.contractAddress) table.appendChild(contractAddress)

  var from = yo`
    <tr class="${css.tr}">
      <td class="${css.td} ${css.tableTitle}"> from </td>
      <td class="${css.td}">${opts.from}
        ${copyToClipboard(() => opts.from)}
      </td>
    </tr>
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
    <td class="${css.td}">${toHash}
      ${copyToClipboard(() => data.to ? data.to : toHash)}
    </td>
    </tr>
  `
  if (opts.to) table.appendChild(to)

  var gas = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> gas </td>
      <td class="${css.td}">${opts.gas} gas
        ${copyToClipboard(() => opts.gas)}
      </td>
    </tr>
  `
  if (opts.gas) table.appendChild(gas)

  var callWarning = ''
  if (opts.isCall) {
    callWarning = '(Cost only applies when called by a contract)'
  }
  if (opts.transactionCost) {
    table.appendChild(yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> transaction cost </td>
      <td class="${css.td}">${opts.transactionCost} gas ${callWarning}
        ${copyToClipboard(() => opts.transactionCost)}
      </td>
    </tr>`)
  }

  if (opts.executionCost) {
    table.appendChild(yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> execution cost </td>
      <td class="${css.td}">${opts.executionCost} gas ${callWarning}
        ${copyToClipboard(() => opts.executionCost)}
      </td>
    </tr>`)
  }

  var hash = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> hash </td>
      <td class="${css.td}">${opts.hash}
        ${copyToClipboard(() => opts.hash)}
      </td>
    </tr>
  `
  if (opts.hash) table.appendChild(hash)

  var input = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> input </td>
      <td class="${css.td}">${helper.shortenHexData(opts.input)}
        ${copyToClipboard(() => opts.input)}
      </td>
    </tr>
  `
  if (opts.input) table.appendChild(input)

  if (opts['decoded input']) {
    var inputDecoded = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> decoded input </td>
      <td class="${css.td}">${opts['decoded input']}
        ${copyToClipboard(opts['decoded input'])}
      </td>
    </tr>`
    table.appendChild(inputDecoded)
  }

  if (opts['decoded output']) {
    var outputDecoded = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> decoded output </td>
      <td class="${css.td}" id="decodedoutput" >${opts['decoded output']}
        ${copyToClipboard(opts['decoded output'])}
      </td>
    </tr>`
    table.appendChild(outputDecoded)
  }

  var stringified = ' - '
  if (opts.logs && opts.logs.decoded) {
    stringified = typeConversion.stringify(opts.logs.decoded)
  }
  var logs = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> logs </td>
      <td class="${css.td}" id="logs">
        ${JSON.stringify(stringified, null, '\t')}
        ${copyToClipboard(() => JSON.stringify(stringified, null, '\t'))}
        ${copyToClipboard(() => JSON.stringify(opts.logs.raw || '0'))}
      </td>
    </tr>
  `
  if (opts.logs) table.appendChild(logs)

  var val = opts.val != null ? typeConversion.toInt(opts.val) : 0
  val = yo`
    <tr class="${css.tr}">
      <td class="${css.td}"> value </td>
      <td class="${css.td}">${val} wei
        ${copyToClipboard(() => `${val} wei`)}
      </td>
    </tr>
  `
  if (opts.val) table.appendChild(val)

  return table
}
