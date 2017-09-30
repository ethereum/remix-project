'use strict'

var Web3 = require('web3')
var EventManager = require('ethereum-remix').lib.EventManager
var EthJSVM = require('ethereumjs-vm')
var ethUtil = require('ethereumjs-util')
var StateManager = require('ethereumjs-vm/lib/stateManager')
var remix = require('ethereum-remix')
var Web3VMProvider = remix.web3.web3VMProvider
var rlp = ethUtil.rlp
var modalDialogCustom = require('./app/ui/modal-dialog-custom')

var injectedProvider

var web3
if (typeof window.web3 !== 'undefined') {
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
    this.keyHashes[ethUtil.sha3(key).toString('hex')] = ethUtil.bufferToHex(key)
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
}

var stateManager = new StateManagerCommonStorageDump({})
var vm = new EthJSVM({
  enableHomestead: true,
  activatePrecompiles: true
})

// FIXME: move state manager in EthJSVM ctr
vm.stateManager = stateManager
vm.blockchain = stateManager.blockchain
vm.trie = stateManager.trie
vm.stateManager.checkpoint()

var web3VM = new Web3VMProvider()
web3VM.setVM(vm)

/*
  trigger contextChanged, web3EndpointChanged
*/
function ExecutionContext () {
  var self = this
  this.event = new EventManager()
  var executionContext = injectedProvider ? 'injected' : 'vm'

  this.getProvider = function () {
    return executionContext
  }

  this.isVM = function () {
    return executionContext === 'vm'
  }

  this.web3 = function () {
    return this.isVM() ? web3VM : web3
  }

  this.internalWeb3 = function () {
    return web3
  }

  this.blankWeb3 = function () {
    return blankWeb3
  }

  this.vm = function () {
    return vm
  }

  this.setContext = function (context, endPointUrl) {
    executionContext = context
    this.executionContextChange(context, endPointUrl)
  }

  this.executionContextChange = function (context, endPointUrl, cb) {
    if (!cb) cb = () => {}
    function runPrompt () {
      if (!endPointUrl) {
        endPointUrl = 'http://localhost:8545'
      }
      modalDialogCustom.prompt(null, 'Web3 Provider Endpoint', endPointUrl, (target) => {
        setProviderFromEndpoint(target, context, cb)
      }, () => {
        cb()
      })
    }

    if (context === 'vm') {
      executionContext = context
      vm.stateManager.revert(function () {
        vm.stateManager.checkpoint()
      })
      self.event.trigger('contextChanged', ['vm'])
      cb()
    }

    if (context === 'injected') {
      if (injectedProvider === undefined) {
        var alertMsg = 'No injected Web3 provider found. '
        alertMsg += 'Make sure your provider (e.g. MetaMask) is active and running '
        alertMsg += '(when recently activated you may have to reload the page).'
        modalDialogCustom.alert(alertMsg)
        cb()
      } else {
        executionContext = context
        web3.setProvider(injectedProvider)
        self.event.trigger('contextChanged', ['injected'])
        cb()
      }
    }

    if (context === 'web3') {
      modalDialogCustom.confirm(null, 'Are you sure you want to connect to an ethereum node?',
        () => { runPrompt(endPointUrl) }, () => { cb() }
      )
    }
  }

  this.currentblockGasLimit = function () {
    return this.blockGasLimit
  }

  this.blockGasLimitDefault = 4300000
  this.blockGasLimit = this.blockGasLimitDefault
  setInterval(() => {
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
  }, 15000)

  function setProviderFromEndpoint (endpoint, context, cb) {
    var oldProvider = web3.currentProvider

    if (endpoint === 'ipc') {
      web3.setProvider(new web3.providers.IpcProvider())
    } else {
      web3.setProvider(new web3.providers.HttpProvider(endpoint))
    }
    if (web3.isConnected()) {
      executionContext = context
      self.event.trigger('contextChanged', ['web3'])
      self.event.trigger('web3EndpointChanged')
      cb()
    } else {
      web3.setProvider(oldProvider)
      var alertMsg = 'Not possible to connect to the Web3 provider. '
      alertMsg += 'Make sure the provider is running and a connection is open (via IPC or RPC).'
      modalDialogCustom.alert(alertMsg)
      cb()
    }
  }
}

module.exports = new ExecutionContext()
