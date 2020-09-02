var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')
var toaster = require('../../ui/tooltip')

var Debugger = require('@remix-project/remix-debug').TransactionDebugger

var SourceHighlighter = require('../../editor/sourceHighlighter')

var EventManager = require('../../../lib/events')

var globalRegistry = require('../../../global/registry')

var remixDebug = require('@remix-project/remix-debug')

var init = remixDebug.init

var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }

  .debuggerConfig {
    display: flex;
    align-items: center;
  }

  .debuggerConfig label {
    margin: 0;
  }

  .debuggerSection {
    padding: 12px 24px 16px;
  }

  .debuggerLabel {
    margin-bottom: 2px;
    font-size: 11px;
    line-height: 12px;
    text-transform: uppercase;
  }
`

class DebuggerUI {

  constructor (debuggerModule, component, fetchContractAndCompile) {
    this.debuggerModule = debuggerModule
    this.fetchContractAndCompile = fetchContractAndCompile
    this.event = new EventManager()

    this.isActive = false
    this.opt = {
      debugWithGeneratedSources: false
    }
    this.sourceHighlighter = new SourceHighlighter()

    this.startTxBrowser()
    this.stepManager = null

    this.statusMessage = ''
    this.currentReceipt

    this.view

    component.appendChild(this.render())

    this.setEditor()
  }

  setEditor () {
    this.editor = globalRegistry.get('editor').api

    this.editor.event.register('breakpointCleared', (fileName, row) => {
      if (this.debugger) this.debugger.breakPointManager.remove({fileName: fileName, row: row})
    })

    this.editor.event.register('breakpointAdded', (fileName, row) => {
      if (this.debugger) this.debugger.breakPointManager.add({fileName: fileName, row: row})
    })

    this.editor.event.register('contentChanged', () => {
      if (this.debugger) this.debugger.unload()
    })
  }

  listenToEvents () {
    if (!this.debugger) return

    this.debugger.event.register('debuggerStatus', async (isActive) => {
      await this.debuggerModule.call('editor', 'discardHighlight')
      this.isActive = isActive
    })

    this.debugger.event.register('newSourceLocation', async (lineColumnPos, rawLocation, generatedSources) => {
      if (!lineColumnPos) return
      const contracts = await this.fetchContractAndCompile(
        this.currentReceipt.contractAddress || this.currentReceipt.to,
        this.currentReceipt)
      if (contracts) {
        let path = contracts.getSourceName(rawLocation.file)
        if (!path) {
          // check in generated sources
          for (const source of generatedSources) {
            if (source.id === rawLocation.file) {
              path = `browser/.debugger/generated-sources/${source.name}`
              let content
              try {
                content = await this.debuggerModule.call('fileManager', 'getFile', path, source.contents)
              } catch (e) {
                console.log('unable to fetch generated sources, the file probably doesn\'t exist yet', e)
              }
              if (content !== source.contents) {
                await this.debuggerModule.call('fileManager', 'setFile', path, source.contents)
              }
              break
            }
          }
        }
        if (path) {
          await this.debuggerModule.call('editor', 'discardHighlight')
          await this.debuggerModule.call('editor', 'highlight', lineColumnPos, path)
        }
      }
    })

    this.debugger.event.register('debuggerUnloaded', () => this.unLoad())
  }

  startTxBrowser () {
    let txBrowser = new TxBrowser()
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', (blockNumber, txNumber, tx) => {
      if (this.debugger) this.debugger.unload()
      this.startDebugging(blockNumber, txNumber, tx)
    })

    txBrowser.event.register('unloadRequested', this, (blockNumber, txIndex, tx) => {
      if (this.debugger) this.debugger.unload()
    })
  }

  isDebuggerActive () {
    return this.isActive
  }

  getDebugWeb3 () {
    return new Promise((resolve, reject) => {
      this.debuggerModule.blockchain.detectNetwork((error, network) => {
        let web3
        if (error || !network) {
          web3 = init.web3DebugNode(this.debuggerModule.blockchain.web3())
        } else {
          const webDebugNode = init.web3DebugNode(network.name)
          web3 = !webDebugNode ? this.debuggerModule.blockchain.web3() : webDebugNode
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
      offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
      compilationResult: async (address) => {
        try {
          return await this.fetchContractAndCompile(address, this.currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      },
      debugWithGeneratedSources: this.opt.debugWithGeneratedSources
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
        offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
        compilationResult: async (address) => {
          try {
            return await this.fetchContractAndCompile(address, this.currentReceipt)
          } catch (e) {
            console.error(e)
          }
          return null
        },
        debugWithGeneratedSources: false
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
    this.debuggerPanelsView = yo`<div class="px-2"></div>`
    this.debuggerHeadPanelsView = yo`<div class="px-2"></div>`
    this.stepManagerView = yo`<div class="px-2"></div>`

    var view = yo`
      <div>
        <div class="px-2">
          <div class="mt-3">
            <p class="mt-2 ${css.debuggerLabel}">Debugger Configuration</p>
              <div class="mt-2 ${css.debuggerConfig} custom-control custom-checkbox">
              <input class="custom-control-input" id="debugGeneratedSourcesInput" onchange=${(event) => { this.opt.debugWithGeneratedSources = event.target.checked }} type="checkbox" title="Debug with generated sources">
              <label data-id="debugGeneratedSourcesLabel" class="form-check-label custom-control-label" for="debugGeneratedSourcesInput">Debug generated sources if available (from Solidity v0.7.2)</label>
            </div>            
          </div>       
          ${this.txBrowser.render()}
          ${this.stepManagerView}
          ${this.debuggerHeadPanelsView}          
        <div class="${css.statusMessage}">${this.statusMessage}</div>
        ${this.debuggerPanelsView}
      </div>
    `
    if (!this.view) {
      this.view = view
    }
    return view
  }

  async unLoad () {
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

  async deleteHighlights () {
    await this.debuggerModule.call('editor', 'discardHighlight')
  }

  renderDebugger () {
    yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
    yo.update(this.debuggerPanelsView, this.vmDebugger.render())
    yo.update(this.stepManagerView, this.stepManager.render())
  }

}

module.exports = DebuggerUI
