import toaster from '../ui/tooltip'
import { DebuggerUI } from '@remix-ui/debugger-ui' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import remixDebug, { TransactionDebugger as Debugger } from '@remix-project/remix-debug'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
const yo = require('yo-yo')
const css = require('./styles/debugger-tab-styles')

const profile = {
  name: 'debugger',
  displayName: 'Debugger',
  methods: ['debug', 'getTrace'],
  events: [],
  icon: 'assets/img/debuggerLogo.webp',
  description: 'Debug transactions',
  kind: 'debugging',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/debugger.html',
  version: packageJson.version
}

class DebuggerTab extends ViewPlugin {
  constructor (blockchain, editor, offsetToLineColumnConverter) {
    super(profile)
    this.el = null
    this.editor = editor
    this.offsetToLineColumnConverter = offsetToLineColumnConverter
    this.blockchain = blockchain
    this.debugHash = null
    this.removeHighlights = false
    this.debugHashRequest = 0
  }

  render () {
    if (this.el) return this.el

    this.el = yo`
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    this.on('fetchAndCompile', 'compiling', (settings) => {
      toaster(yo`<div><b>Recompiling and debugging with params</b><pre class="text-left">${JSON.stringify(settings, null, '\t')}</pre></div>`)
    })

    this.on('fetchAndCompile', 'compilationFailed', (data) => {
      toaster(yo`<div><b>Compilation failed...</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'notFound', (contractAddress) => {
      toaster(yo`<div><b>Contract ${contractAddress} not found in source code repository</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'usingLocalCompilation', (contractAddress) => {
      toaster(yo`<div><b>Using compilation result from Solidity module</b></div>`)
    })

    this.on('fetchAndCompile', 'sourceVerificationNotAvailable', () => {
      toaster(yo`<div><b>Source verification plugin not activated or not available.</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.renderComponent()

    // this.call('manager', 'activatePlugin', 'udapp')

    return this.el
  }

  async discardHighlight () {
    await this.call('editor', 'discardHighlight')
  }

  async highlight (lineColumnPos, path) {
    await this.call('editor', 'highlight', lineColumnPos, path)
  }

  async getFile (path) {
    await this.call('fileManager', 'getFile', path)
  }

  async setFile (path, content) {
    await this.call('fileManager', 'setFile', path, content)
  }

  renderComponent () {
    ReactDOM.render(
      <DebuggerUI debuggerAPI={this} />
      , this.el)
  }

  deactivate () {
    this.removeHighlights = true
    this.renderComponent()
    super.deactivate()
  }

  debug (hash) {
    this.debugHash = hash
    this.debugHashRequest++ // so we can trigger a debug using the same hash 2 times in a row. that's needs to be improved
    this.renderComponent()
  }

  getDebugWeb3 () {
    return new Promise((resolve, reject) => {
      this.blockchain.detectNetwork((error, network) => {
        let web3
        if (error || !network) {
          web3 = remixDebug.init.web3DebugNode(this.blockchain.web3())
        } else {
          const webDebugNode = remixDebug.init.web3DebugNode(network.name)
          web3 = !webDebugNode ? this.blockchain.web3() : webDebugNode
        }
        remixDebug.init.extendWeb3(web3)
        resolve(web3)
      })
    })
  }

  async getTrace (hash) {
    if (!hash) return
    const web3 = await this.getDebugWeb3()
    const currentReceipt = await web3.eth.getTransactionReceipt(hash)
    const debug = new Debugger({
      web3,
      offsetToLineColumnConverter: this.offsetToLineColumnConverter,
      compilationResult: async (address) => {
        try {
          return await this.fetchContractAndCompile(address, currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      },
      debugWithGeneratedSources: false
    })
    return await debug.debugger.traceManager.getTrace(hash)
  }

  fetchContractAndCompile (address, receipt) {
    const target = (address && remixDebug.traceHelper.isContractCreation(address)) ? receipt.contractAddress : address

    return this.call('fetchAndCompile', 'resolve', target || receipt.contractAddress || receipt.to, 'browser/.debug', this.blockchain.web3())
  }

  // debugger () {
  //   return this.debuggerUI
  // }
}

module.exports = DebuggerTab
