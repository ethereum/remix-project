var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')

//var Debugger = require('./debugger/debugger')
var Debugger = require('remix-debug').TransactionDebugger

var SourceHighlighter = require('../editor/sourceHighlighter')

var EventManager = require('../../lib/events')

var executionContext = require('../../execution-context')
var globalRegistry = require('../../global/registry')

var remixLib = require('remix-lib')
var Web3Providers = remixLib.vm.Web3Providers
var DummyProvider = remixLib.vm.DummyProvider

var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }
  .innerShift {
    padding: 2px;
    margin-left: 10px;
  }
`

class ContextManager {
  constructor () {
    this.web3 = executionContext.web3()
    this.event = new EventManager()
  }
}

class DebuggerUI {

  constructor (container) {
    this.registry = globalRegistry
    this.event = new EventManager()

    this.executionContext = executionContext

    this.debugger = new Debugger({
      web3: executionContext.web3(),
      offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
      compiler: this.registry.get('compiler').api,
      compilersArtefacts: this.registry.get('compilersartefacts').api
    })

    this.debugger.web3Providers = new Web3Providers()
    this.debugger.executionContext = this.executionContext
    this.debugger.addProvider('DUMMYWEB3', new DummyProvider())
    this.debugger.switchProvider('DUMMYWEB3')

    this.debugger.addProvider('vm', this.executionContext.vm())
    this.debugger.addProvider('injected', this.executionContext.internalWeb3())
    this.debugger.addProvider('web3', this.executionContext.internalWeb3())
    this.debugger.switchProvider(this.executionContext.getProvider())

    this.isActive = false

    this.sourceHighlighter = new SourceHighlighter()

    this.startTxBrowser()
    this.stepManager = null

    this.statusMessage = ''

    this.view

    container.appendChild(this.render())

    this.setEditor()
    this.listenToEvents()
  }

  setupExecutionContext () {
    this.executionContext.event.register('contextChanged', this, function (context) {
      // TODO: was already broken
      //self.switchProvider(context)
    })

    this.debugger.addProvider('vm', this.executionContext.vm())
    this.debugger.addProvider('injected', this.executionContext.internalWeb3())
    this.debugger.addProvider('web3', this.executionContext.internalWeb3())
    this.debugger.switchProvider(this.executionContext.getProvider())
  }

  setEditor () {
    const self = this
    this.editor = this.registry.get('editor').api

    self.editor.event.register('breakpointCleared', (fileName, row) => {
      self.debugger.breakPointManager.remove({fileName: fileName, row: row})
    })

    self.editor.event.register('breakpointAdded', (fileName, row) => {
      self.debugger.breakPointManager.add({fileName: fileName, row: row})
    })

    self.editor.event.register('contentChanged', function () {
      self.debugger.unload()
    })
  }

  listenToEvents () {
    const self = this
    this.debugger.event.register('debuggerStatus', function (isActive) {
      self.sourceHighlighter.currentSourceLocation(null)
      self.isActive = isActive
    })

    this.debugger.event.register('newSourceLocation', function (lineColumnPos, rawLocation) {
      self.sourceHighlighter.currentSourceLocation(lineColumnPos, rawLocation)
    })

    this.debugger.event.register('debuggerUnloaded', self.unLoad.bind(this))
  }

  startTxBrowser () {
    const self = this
    let txBrowser = new TxBrowser()
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      self.debugger.unload()
      self.startDebugging(blockNumber, txNumber, tx)
    })

    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger.unload()
    })
  }

  isDebuggerActive () {
    return this.isActive
  }

  startDebugging (blockNumber, txNumber, tx) {
    const self = this

    this.debugger.debugger.updateWeb3(this.executionContext.web3())
    this.debugger.debug(blockNumber, txNumber, tx, () => {
      self.stepManager = new StepManagerUI(this.debugger.step_manager)
      self.vmDebugger = new VmDebugger(this.debugger.vmDebuggerLogic)
      self.renderDebugger()
    })
  }

  debug (txHash) {
    this.startDebugging(null, txHash, null)
  }

  render () {
    this.debuggerPanelsView = yo`<div class="${css.innerShift}"></div>`
    this.debuggerHeadPanelsView = yo`<div class="${css.innerShift}"></div>`
    this.stepManagerView = yo`<div class="${css.innerShift}"></div>`

    var view = yo`<div>
        <div class="${css.innerShift}">
          ${this.txBrowser.render()}
          ${this.debuggerHeadPanelsView}
          ${this.stepManagerView}
        </div>
        <div class="${css.statusMessage}" >${this.statusMessage}</div>
        ${this.debuggerPanelsView}
     </div>`
    if (!this.view) {
      this.view = view
    }
    return view
  }

  unLoad () {
    yo.update(this.debuggerHeadPanelsView, yo`<div></div>`)
    yo.update(this.debuggerPanelsView, yo`<div></div>`)
    yo.update(this.stepManagerView, yo`<div></div>`)
    if (this.vmDebugger) this.vmDebugger.remove()
    if (this.stepManager) this.stepManager.remove()
    this.vmDebugger = null
    this.stepManager = null
    this.event.trigger('traceUnloaded')
  }

  renderDebugger () {
    yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
    yo.update(this.debuggerPanelsView, this.vmDebugger.render())
    yo.update(this.stepManagerView, this.stepManager.render())
  }

}

module.exports = DebuggerUI
