/* global ethereum */
'use strict'
var Web3 = require('web3')
var EventManager = require('../eventManager')
var EthJSVM = require('ethereumjs-vm').default
var ethUtil = require('ethereumjs-util')
var StateManager = require('ethereumjs-vm/dist/state/stateManager').default
var Web3VMProvider = require('../web3Provider/web3VmProvider')

var LogsManager = require('./logsManager.js')

var rlp = ethUtil.rlp

var injectedProvider

var web3
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  injectedProvider = window.web3.currentProvider
  web3 = new Web3(injectedProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}

var blankWeb3 = new Web3()

/*
  extend vm state manager and instanciate VM
*/

class StateManagerCommonStorageDump extends StateManager {
  constructor (arg) {
    super(arg)
    this.keyHashes = {}
  }

  putContractStorage (address, key, value, cb) {
    this.keyHashes[ethUtil.keccak(key).toString('hex')] = ethUtil.bufferToHex(key)
    super.putContractStorage(address, key, value, cb)
  }

  dumpStorage (address, cb) {
    var self = this
    this._getStorageTrie(address, function (err, trie) {
      if (err) {
        return cb(err)
      }
      var storage = {}
      var stream = trie.createReadStream()
      stream.on('data', function (val) {
        var value = rlp.decode(val.value)
        storage['0x' + val.key.toString('hex')] = {
          key: self.keyHashes[val.key.toString('hex')],
          value: '0x' + value.toString('hex')
        }
      })
      stream.on('end', function () {
        cb(storage)
      })
    })
  }

  getStateRoot (cb) {
    let checkpoint = this._checkpointCount
    this._checkpointCount = 0
    super.getStateRoot((err, stateRoot) => {
      this._checkpointCount = checkpoint
      cb(err, stateRoot)
    })
  }

  setStateRoot (stateRoot, cb) {
    let checkpoint = this._checkpointCount
    this._checkpointCount = 0
    super.setStateRoot(stateRoot, (err) => {
      this._checkpointCount = checkpoint
      cb(err)
    })
  }
}

function createVm (hardfork) {
  var stateManager = new StateManagerCommonStorageDump({})
  stateManager.checkpoint(() => {})
  var vm = new EthJSVM({
    activatePrecompiles: true,
    blockchain: stateManager.blockchain,
    stateManager: stateManager,
    hardfork: hardfork
  })
  vm.blockchain.validate = false
  var web3vm = new Web3VMProvider()
  web3vm.setVM(vm)
  return { vm, web3vm, stateManager }
}

var vms = {
  byzantium: createVm('byzantium'),
  constantinople: createVm('constantinople'),
  petersburg: createVm('petersburg'),
  istanbul: createVm('istanbul')
}

var mainNetGenesisHash = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'

/*
  trigger contextChanged, web3EndpointChanged
*/
function ExecutionContext () {
  var self = this
  this.event = new EventManager()

  this.logsManager = new LogsManager()

  var executionContext = null

  this.blockGasLimitDefault = 4300000
  this.blockGasLimit = this.blockGasLimitDefault
  this.customNetWorks = {}
  this.blocks = {}
  this.latestBlockNumber = 0
  this.txs = {}

  this.init = function (config) {
    if (config.get('settings/always-use-vm')) {
      executionContext = 'vm'
    } else {
      executionContext = injectedProvider ? 'injected' : 'vm'
      if (executionContext === 'injected') this.askPermission()
    }
  }

  this.askPermission = function () {
    // metamask
    if (ethereum && typeof ethereum.enable === 'function') ethereum.enable()
  }

  this.getProvider = function () {
    return executionContext
  }

  this.isVM = function () {
    return executionContext === 'vm'
  }

  this.web3 = function () {
    return this.isVM() ? vms.istanbul.web3vm : web3
  }

  this.detectNetwork = function (callback) {
    if (this.isVM()) {
      callback(null, { id: '-', name: 'VM' })
    } else {
      this.web3().version.getNetwork((err, id) => {
        var name = null
        if (err) name = 'Unknown'
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
        else if (id === '1') name = 'Main'
        else if (id === '2') name = 'Morden (deprecated)'
        else if (id === '3') name = 'Ropsten'
        else if (id === '4') name = 'Rinkeby'
        else if (id === '5') name = 'Goerli'
        else if (id === '42') name = 'Kovan'
        else name = 'Custom'

        if (id === '1') {
          this.web3().eth.getBlock(0, (error, block) => {
            if (error) console.log('cant query first block')
            if (block && block.hash !== mainNetGenesisHash) name = 'Custom'
            callback(err, { id, name })
          })
        } else {
          callback(err, { id, name })
        }
      })
    }
  }

  this.removeProvider = function (name) {
    if (name && this.customNetWorks[name]) {
      delete this.customNetWorks[name]
      self.event.trigger('removeProvider', [name])
    }
  }

  this.addProvider = function (network) {
    if (network && network.name && network.url) {
      this.customNetWorks[network.name] = network
      self.event.trigger('addProvider', [network])
    }
  }

  this.internalWeb3 = function () {
    return web3
  }

  this.blankWeb3 = function () {
    return blankWeb3
  }

  this.vm = function () {
    return vms.istanbul.vm
  }

  this.setContext = function (context, endPointUrl, confirmCb, infoCb) {
    executionContext = context
    this.executionContextChange(context, endPointUrl, confirmCb, infoCb)
  }

  this.executionContextChange = function (context, endPointUrl, confirmCb, infoCb, cb) {
    if (!cb) cb = () => {}

    if (context === 'vm') {
      executionContext = context
      vms.istanbul.stateManager.revert(() => {
        vms.istanbul.stateManager.checkpoint(() => {})
      })
      self.event.trigger('contextChanged', ['vm'])
      return cb()
    }

    if (context === 'injected') {
      if (injectedProvider === undefined) {
        var alertMsg = 'No injected Web3 provider found. '
        alertMsg += 'Make sure your provider (e.g. MetaMask) is active and running '
        alertMsg += '(when recently activated you may have to reload the page).'
        infoCb(alertMsg)
        return cb()
      } else {
        self.askPermission()
        executionContext = context
        web3.setProvider(injectedProvider)
        self._updateBlockGasLimit()
        self.event.trigger('contextChanged', ['injected'])
        return cb()
      }
    }

    if (context === 'web3') {
      confirmCb(cb)
    }

    if (this.customNetWorks[context]) {
      var provider = this.customNetWorks[context]
      setProviderFromEndpoint(provider.url, 'web3', () => { cb() })
    }
  }

  this.currentblockGasLimit = function () {
    return this.blockGasLimit
  }

  this.stopListenOnLastBlock = function () {
    if (this.listenOnLastBlockId) clearInterval(this.listenOnLastBlockId)
    this.listenOnLastBlockId = null
  }

  this._updateBlockGasLimit = function () {
    if (this.getProvider() !== 'vm') {
      web3.eth.getBlock('latest', (err, block) => {
        if (!err) {
          // we can't use the blockGasLimit cause the next blocks could have a lower limit : https://github.com/ethereum/remix/issues/506
          this.blockGasLimit = (block && block.gasLimit) ? Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024) : this.blockGasLimitDefault
        } else {
          this.blockGasLimit = this.blockGasLimitDefault
        }
      })
    }
  }

  this.listenOnLastBlock = function () {
    this.listenOnLastBlockId = setInterval(() => {
      this._updateBlockGasLimit()
    }, 15000)
  }

  // TODO: not used here anymore and needs to be moved
  function setProviderFromEndpoint (endpoint, context, cb) {
    var oldProvider = web3.currentProvider

    if (endpoint === 'ipc') {
      web3.setProvider(new web3.providers.IpcProvider())
    } else {
      web3.setProvider(new web3.providers.HttpProvider(endpoint))
    }
    if (web3.isConnected()) {
      executionContext = context
      self._updateBlockGasLimit()
      self.event.trigger('contextChanged', ['web3'])
      self.event.trigger('web3EndpointChanged')
      cb()
    } else {
      web3.setProvider(oldProvider)
      var alertMsg = 'Not possible to connect to the Web3 provider. '
      alertMsg += 'Make sure the provider is running and a connection is open (via IPC or RPC).'
      cb(alertMsg)
    }
  }
  this.setProviderFromEndpoint = setProviderFromEndpoint

  this.txDetailsLink = function (network, hash) {
    if (transactionDetailsLinks[network]) {
      return transactionDetailsLinks[network] + hash
    }
  }

  this.addBlock = function (block) {
    let blockNumber = '0x' + block.header.number.toString('hex')
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }
    blockNumber = web3.toHex(web3.toBigNumber(blockNumber))

    self.blocks['0x' + block.hash().toString('hex')] = block
    self.blocks[blockNumber] = block
    self.latestBlockNumber = blockNumber

    this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  this.trackTx = function (tx, block) {
    self.txs[tx] = block
  }
}

var transactionDetailsLinks = {
  'Main': 'https://www.etherscan.io/tx/',
  'Rinkeby': 'https://rinkeby.etherscan.io/tx/',
  'Ropsten': 'https://ropsten.etherscan.io/tx/',
  'Kovan': 'https://kovan.etherscan.io/tx/',
  'Goerli': 'https://goerli.etherscan.io/tx/'
}

module.exports = new ExecutionContext()
