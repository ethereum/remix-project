var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')
var toaster = require('../../ui/tooltip')

var Debugger = require('remix-debug').TransactionDebugger

var SourceHighlighter = require('../../editor/sourceHighlighter')

var EventManager = require('../../../lib/events')

var globalRegistry = require('../../../global/registry')

var remixLib = require('remix-lib')

var init = remixLib.init

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

  constructor (container, blockchain, fetchContractAndCompile) {
    this.registry = globalRegistry
    this.blockchain = blockchain
    this.fetchContractAndCompile = fetchContractAndCompile
    this.event = new EventManager()

    this.isActive = false

    this.sourceHighlighter = new SourceHighlighter()

    this.startTxBrowser()
    this.stepManager = null

    this.statusMessage = ''
    this.currentReceipt

    this.view

    container.appendChild(this.render())

    this.setEditor()
  }

  setEditor () {
    const self = this
    this.editor = this.registry.get('editor').api

    self.editor.event.register('breakpointCleared', (fileName, row) => {
      if (self.debugger) self.debugger.breakPointManager.remove({fileName: fileName, row: row})
    })

    self.editor.event.register('breakpointAdded', (fileName, row) => {
      if (self.debugger) self.debugger.breakPointManager.add({fileName: fileName, row: row})
    })

    self.editor.event.register('contentChanged', function () {
      if (self.debugger) self.debugger.unload()
    })
  }

  listenToEvents () {
    const self = this
    if (!self.debugger) return

    this.debugger.event.register('debuggerStatus', function (isActive) {
      self.sourceHighlighter.currentSourceLocation(null)
      self.isActive = isActive
    })

    this.debugger.event.register('newSourceLocation', async function (lineColumnPos, rawLocation) {
      const contracts = await self.fetchContractAndCompile(
        self.currentReceipt.contractAddress || self.currentReceipt.to,
        self.currentReceipt)
      if (contracts) {
        const path = contracts.getSourceName(rawLocation.file)
        if (path) self.sourceHighlighter.currentSourceLocationFromfileName(lineColumnPos, path)
      }
    })

    this.debugger.event.register('debuggerUnloaded', self.unLoad.bind(this))
  }

  startTxBrowser () {
    const self = this
    let txBrowser = new TxBrowser()
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      if (self.debugger) self.debugger.unload()
      self.startDebugging(blockNumber, txNumber, tx)
    })

    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      if (self.debugger) self.debugger.unload()
    })
  }

  isDebuggerActive () {
    return this.isActive
  }

  getDebugWeb3 () {
    return new Promise((resolve, reject) => {
      this.blockchain.detectNetwork((error, network) => {
        let web3
        if (error || !network) {
          web3 = init.web3DebugNode(this.blockchain.web3())
        } else {
          const webDebugNode = init.web3DebugNode(network.name)
          web3 = !webDebugNode ? this.blockchain.web3() : webDebugNode
        }
        init.extendWeb3(web3)
        resolve(web3)
      })
    })
  }

  async startDebugging (blockNumber, txNumber, tx) {
    if (this.debugger) this.unLoad()

    let web3 = await this.getDebugWeb3()
    this.currentReceipt = await web3.eth.getTransactionReceipt(txNumber)
    this.debugger = new Debugger({
      web3,
      offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
      compilationResult: async (address) => {
        try {
          return await this.fetchContractAndCompile(address, this.currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      }
    })

    this.listenToEvents()
    this.debugger.debug(blockNumber, txNumber, tx, () => {
      this.stepManager = new StepManagerUI(this.debugger.step_manager)
      this.vmDebugger = new VmDebugger(this.debugger.vmDebuggerLogic)
      this.txBrowser.setState({ blockNumber, txNumber, debugging: true })
      this.renderDebugger()
    }).catch((error) => {
      toaster(error)
      this.unLoad()
    })
  }

  getTrace (hash) {
    return new Promise(async (resolve, reject) => {
      const web3 = await this.getDebugWeb3()

      this.currentReceipt = await web3.eth.getTransactionReceipt(hash)
      const debug = new Debugger({
        web3,
        offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
        compilationResult: async (address) => {
          try {
            return await this.fetchContractAndCompile(address, this.currentReceipt)
          } catch (e) {
            console.error(e)
          }
          return null
        }
      })
      debug.debugger.traceManager.traceRetriever.getTrace(hash, (error, trace) => {
        if (error) return reject(error)
        resolve(trace)
      })
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
    if (this.txBrowser) this.txBrowser.setState({debugging: false})
    this.vmDebugger = null
    this.stepManager = null
    if (this.debugger) delete this.debugger
    this.event.trigger('traceUnloaded')
  }

  renderDebugger () {
    yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
    yo.update(this.debuggerPanelsView, this.vmDebugger.render())
    yo.update(this.stepManagerView, this.stepManager.render())
  }

}

module.exports = DebuggerUI
