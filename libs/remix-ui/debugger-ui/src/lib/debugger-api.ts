import Web3 from 'web3'
import remixDebug, { TransactionDebugger as Debugger } from '@remix-project/remix-debug'
import { CompilationOutput, Sources } from './idebugger-api'
import type { CompilationResult } from '@remix-project/remix-solidity-ts'

export const DebuggerApiMixin = (Base) => class extends Base {
  initDebuggerApi () {
    this.debugHash = null
        
    const self = this
    this.web3Provider = {
      sendAsync(payload, callback) {
        self.call('web3Provider', 'sendAsync', payload)
          .then(result => callback(null, result))
          .catch(e => callback(e))
      }
    }
    this._web3 = new Web3(this.web3Provider)

    this.offsetToLineColumnConverter = {
      async offsetToLineColumn (rawLocation, file, sources, asts) {
        return await self.call('offsetToLineColumnConverter', 'offsetToLineColumn', rawLocation, file, sources, asts)
      }
    }
  }

  // on()
  // call()
  // onDebugRequested()
  // onRemoveHighlights()

  web3 () {
    return this._web3
  }

  async discardHighlight () {
    await this.call('editor', 'discardHighlight')
  }

  async highlight (lineColumnPos, path) {
    await this.call('editor', 'highlight', lineColumnPos, path)
  }

  async getFile (path) {
    return await this.call('fileManager', 'getFile', path)
  }

  async setFile (path, content) {
    await this.call('fileManager', 'setFile', path, content)
  }

  onBreakpointCleared (listener) {
    this.onBreakpointClearedListener = listener
  }

  onBreakpointAdded (listener) {
    this.onBreakpointAddedListener = listener
  }

  onEditorContentChanged (listener) {
    this.onEditorContentChangedListener = listener
  }

  onDebugRequested (listener) {
    this.onDebugRequestedListener = listener
  }

  onRemoveHighlights (listener) {
    this.onRemoveHighlightsListener = listener
  }

  async fetchContractAndCompile (address, receipt) {
    const target = (address && remixDebug.traceHelper.isContractCreation(address)) ? receipt.contractAddress : address
    const targetAddress = target || receipt.contractAddress || receipt.to
    const codeAtAddress = await this._web3.eth.getCode(targetAddress)
    const output = await this.call('fetchAndCompile', 'resolve', targetAddress, codeAtAddress, 'browser/.debug')
    return new CompilerAbstract(output.languageversion, output.data, output.source)
  }

  async getDebugWeb3 () {
    let web3
    let network
    try {
      network = await this.call('network', 'detectNetwork')    
    } catch (e) {
      web3 = this.web3()
    }
    if (!web3) {
      const webDebugNode = remixDebug.init.web3DebugNode(network.name)
      web3 = !webDebugNode ? this.web3() : webDebugNode
    }
    remixDebug.init.extendWeb3(web3)
    return web3
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

  debug (hash) {
    this.debugHash = hash
    this.onDebugRequestedListener(hash)
  }

  onActivation () {
    this.on('editor', 'breakpointCleared', (fileName, row) => this.onBreakpointClearedListener(fileName, row))
    this.on('editor', 'breakpointAdded', (fileName, row) => this.onBreakpointAddedListener(fileName, row))
    this.on('editor', 'contentChanged', () => this.onEditorContentChangedListener())  
  }

  onDeactivation () {
    this.onRemoveHighlightsListener()
    this.off('editor', 'breakpointCleared')
    this.off('editor', 'breakpointAdded')
    this.off('editor', 'contentChanged')
  }
}

export class CompilerAbstract implements CompilationOutput { // this is a subset of /remix-ide/src/app/compiler/compiler-abstract.js
  languageversion
  data
  source

  constructor (languageversion: string, data: CompilationResult, source: { sources: Sources, target: string }) {
    this.languageversion = languageversion
    this.data = data
    this.source = source // source code
  }

  getSourceName (fileIndex) {
    if (this.data && this.data.sources) {
      return Object.keys(this.data.sources)[fileIndex]
    } else if (Object.keys(this.source.sources).length === 1) {
      // if we don't have ast, we return the only one filename present.
      const sourcesArray = Object.keys(this.source.sources)
      return sourcesArray[0]
    }
    return null
  }  
}

