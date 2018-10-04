var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')

var Debugger = require('./debugger/debugger')

var SourceHighlighter = require('../editor/sourceHighlighter')

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var executionContext = require('../../execution-context')
var globalRegistry = require('../../global/registry')

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

class DebuggerUI {

  constructor (container) {
    this.registry = globalRegistry
    this.event = new EventManager()

    this.transactionDebugger = new Debugger({
      executionContext: executionContext,
      offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
      compiler: this.registry.get('compiler').api
    })

    this.debugger = this.transactionDebugger.debugger
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

  setEditor () {
    const self = this
    this.editor = this.registry.get('editor').api

    self.editor.event.register('breakpointCleared', (fileName, row) => {
      self.transactionDebugger.breakPointManager.remove({fileName: fileName, row: row})
    })

    self.editor.event.register('breakpointAdded', (fileName, row) => {
      self.transactionDebugger.breakPointManager.add({fileName: fileName, row: row})
    })

    // unload if a file has changed (but not if tabs were switched)
    self.editor.event.register('contentChanged', function () {
      self.debugger.unLoad()
    })
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.event.register('debuggerStatus', function (isActive) {
      self.sourceHighlighter.currentSourceLocation(null)
      self.isActive = isActive
    })

    this.transactionDebugger.event.register('newSourceLocation', function (lineColumnPos, rawLocation) {
      self.sourceHighlighter.currentSourceLocation(lineColumnPos, rawLocation)
    })
  }

  startTxBrowser () {
    const self = this
    let txBrowser = new TxBrowser()
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      self.debugger.unLoad()
      self.unLoad()
      self.startDebugging(blockNumber, txNumber, tx)
    })

    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger.unLoad()
      self.unLoad()
    })
  }

  isDebuggerActive () {
    return this.isActive
  }

  startDebugging (blockNumber, txNumber, tx) {
    const self = this

    this.transactionDebugger.debug(blockNumber, txNumber, tx, () => {
      self.stepManager = new StepManagerUI(this.transactionDebugger.step_manager)
      self.vmDebugger = new VmDebugger(this.transactionDebugger.vmDebuggerLogic)
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
