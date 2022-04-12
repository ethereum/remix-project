/* global ethereum */
'use strict'
import Web3 from 'web3'
import { execution } from '@remix-project/remix-lib'
import EventManager from '../lib/events'
const _paq = window._paq = window._paq || []

let web3

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  var injectedProvider = window.ethereum
  web3 = new Web3(injectedProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}

/*
  trigger contextChanged, web3EndpointChanged
*/
export class ExecutionContext {
  constructor () {
    this.event = new EventManager()
    this.executionContext = null
    this.lastBlock = null
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = 'london'
    this.mainNetGenesisHash = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
    this.customNetWorks = {}
    this.blocks = {}
    this.latestBlockNumber = 0
    this.txs = {}
    this.customWeb3 = {} // mapping between a context name and a web3.js instance
  }

  init (config) {
    if (config.get('settings/always-use-vm')) {
      this.executionContext = 'vm'
    } else {
      this.executionContext = injectedProvider ? 'injected' : 'vm'
      if (this.executionContext === 'injected') this.askPermission()
    }
  }

  askPermission () {
    // metamask
    if (ethereum && typeof ethereum.enable === 'function') ethereum.enable()
  }

  getProvider () {
    return this.executionContext
  }

  getSelectedAddress () {
    return injectedProvider ? injectedProvider.selectedAddress : null
  }

  getCurrentFork () {
    return this.currentFork
  }

  isVM () {
    return this.executionContext === 'vm'
  }

  setWeb3 (context, web3) {
    this.customWeb3[context] = web3
  }

  web3 () {
    if (this.customWeb3[this.executionContext]) return this.customWeb3[this.executionContext]
    return web3
  }

  detectNetwork (callback) {
    if (this.isVM()) {
      callback(null, { id: '-', name: 'VM' })
    } else {
      if (!web3.currentProvider) {
        return callback('No provider set')
      }
      if (web3.currentProvider.isConnected && !web3.currentProvider.isConnected()) {
        if (web3.currentProvider.isMetaMask) {
          this.askPermission()
        }
        return callback('Provider not connected')
      }
      web3.eth.net.getId((err, id) => {
        let name = null
        if (err) name = 'Unknown'
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
        else if (id === 1) name = 'Main'
        else if (id === 3) name = 'Ropsten'
        else if (id === 4) name = 'Rinkeby'
        else if (id === 5) name = 'Goerli'
        else if (id === 42) name = 'Kovan'
        else name = 'Custom'

        if (id === '1') {
          web3.eth.getBlock(0, (error, block) => {
            if (error) console.log('cant query first block')
            if (block && block.hash !== this.mainNetGenesisHash) name = 'Custom'
            callback(err, { id, name, lastBlock: this.lastBlock, currentFork: this.currentFork })
          })
        } else {
          callback(err, { id, name, lastBlock: this.lastBlock, currentFork: this.currentFork })
        }
      })
    }
  }

  removeProvider (name) {
    if (name && this.customNetWorks[name]) {
      if (this.executionContext === name) this.setContext('vm', null, null, null)
      delete this.customNetWorks[name]
      this.event.trigger('removeProvider', [name])
    }
  }

  addProvider (network) {
    if (network && network.name && !this.customNetWorks[network.name]) {
      this.customNetWorks[network.name] = network
      this.event.trigger('addProvider', [network])
    }
  }

  internalWeb3 () {
    return web3
  }

  blankWeb3 () {
    return new Web3()
  }

  setContext (context, endPointUrl, confirmCb, infoCb) {
    this.executionContext = context
    this.executionContextChange(context, endPointUrl, confirmCb, infoCb, null)
  }

  async executionContextChange (value, endPointUrl, confirmCb, infoCb, cb) {
    _paq.push(['trackEvent', 'udapp', 'providerChanged', value.context])
    const context = value.context
    if (!cb) cb = () => { /* Do nothing. */ }
    if (!confirmCb) confirmCb = () => { /* Do nothing. */ }
    if (!infoCb) infoCb = () => { /* Do nothing. */ }
    if (context === 'vm') {
      this.executionContext = context
      this.currentFork = value.fork
      this.event.trigger('contextChanged', ['vm'])
      return cb()
    }

    if (context === 'injected') {
      if (injectedProvider === undefined) {
        infoCb('No injected Web3 provider found. Make sure your provider (e.g. MetaMask) is active and running (when recently activated you may have to reload the page).')
        return cb()
      } else {
        this.askPermission()
        this.executionContext = context
        web3.setProvider(injectedProvider)
        await this._updateChainContext()
        this.event.trigger('contextChanged', ['injected'])
        return cb()
      }
    }

    if (context === 'web3') {
      confirmCb(cb)
    }
    if (this.customNetWorks[context]) {
      var network = this.customNetWorks[context]
      this.setProviderFromEndpoint(network.provider, { context: network.name }, (error) => {
        if (error) infoCb(error)
        cb()
      })
    }
  }

  currentblockGasLimit () {
    return this.blockGasLimit
  }

  stopListenOnLastBlock () {
    if (this.listenOnLastBlockId) clearInterval(this.listenOnLastBlockId)
    this.listenOnLastBlockId = null
  }

  async _updateChainContext () {
    if (this.getProvider() !== 'vm') {
      try {
        const block = await web3.eth.getBlock('latest')
        // we can't use the blockGasLimit cause the next blocks could have a lower limit : https://github.com/ethereum/remix/issues/506
        this.blockGasLimit = (block && block.gasLimit) ? Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024) : this.blockGasLimitDefault
        this.lastBlock = block
        try {
          this.currentFork = execution.forkAt(await web3.eth.net.getId(), block.number)
        } catch (e) {
          this.currentFork = 'london'
          console.log(`unable to detect fork, defaulting to ${this.currentFork}..`)
          console.error(e)
        }
      } catch (e) {
        console.error(e)
        this.blockGasLimit = this.blockGasLimitDefault
      }
    }
  }

  listenOnLastBlock () {
    this.listenOnLastBlockId = setInterval(() => {
      this._updateChainContext()
    }, 15000)
  }

  // TODO: remove this when this function is moved

  setProviderFromEndpoint (endpoint, value, cb) {
    const oldProvider = web3.currentProvider
    const context = value.context

    web3.setProvider(endpoint)
    web3.eth.net.isListening((err, isConnected) => {
      if (!err && isConnected === true) {
        this.executionContext = context
        this._updateChainContext()
        this.event.trigger('contextChanged', [context])
        this.event.trigger('web3EndpointChanged')
        cb()
      } else if (isConnected === 'canceled') {
        web3.setProvider(oldProvider)
        cb()
      } else {
        web3.setProvider(oldProvider)
        cb(`Not possible to connect to ${context}. Make sure the provider is running, a connection is open (via IPC or RPC) or that the provider plugin is properly configured.`)
      }
    })
  }

  txDetailsLink (network, hash) {
    const transactionDetailsLinks = {
      Main: 'https://www.etherscan.io/tx/',
      Rinkeby: 'https://rinkeby.etherscan.io/tx/',
      Ropsten: 'https://ropsten.etherscan.io/tx/',
      Kovan: 'https://kovan.etherscan.io/tx/',
      Goerli: 'https://goerli.etherscan.io/tx/'
    }

    if (transactionDetailsLinks[network]) {
      return transactionDetailsLinks[network] + hash
    }
  }
}
