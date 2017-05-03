/* global confirm, prompt */
'use strict'

var Web3 = require('web3')
var EventManager = require('../lib/eventManager')
var EthJSVM = require('ethereumjs-vm')
var ethUtil = require('ethereumjs-util')
var StateManager = require('ethereumjs-vm/lib/stateManager')

var injectedProvider

var web3
if (typeof window.web3 !== 'undefined') {
  injectedProvider = window.web3.currentProvider
  web3 = new Web3(injectedProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}

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
        storage['0x' + val.key.toString('hex')] = {
          key: self.keyHashes[val.key.toString('hex')],
          value: '0x' + val.value.toString('hex')
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
    return web3
  }

  this.vm = function () {
    return vm
  }

  this.setContext = function (context, endPointUrl) {
    executionContext = context
    executionContextChange(context, endPointUrl)
  }

  function executionContextChange (context, endPointUrl) {
    if (context === 'web3' && !confirm('Are you sure you want to connect to an ethereum node?')) {
      return false
    } else if (context === 'injected' && injectedProvider === undefined) {
      return false
    } else {
      if (context === 'web3') {
        executionContext = context
        if (!endPointUrl) {
          endPointUrl = 'http://localhost:8545'
        }
        endPointUrl = prompt('Web3 Provider Endpoint', endPointUrl)
        setProviderFromEndpoint(endPointUrl)
        self.event.trigger('contextChanged', ['web3'])
      } else if (context === 'injected') {
        executionContext = context
        web3.setProvider(injectedProvider)
        self.event.trigger('contextChanged', ['injected'])
      } else if (context === 'vm') {
        executionContext = context
        vm.stateManager.revert(function () {
          vm.stateManager.checkpoint()
        })
        self.event.trigger('contextChanged', ['vm'])
      }
      return true
    }
  }

  function setProviderFromEndpoint (endpoint) {
    if (endpoint === 'ipc') {
      web3.setProvider(new web3.providers.IpcProvider())
    } else {
      web3.setProvider(new web3.providers.HttpProvider(endpoint))
    }
    self.event.trigger('web3EndpointChanged')
  }

  /* ---------------------------------------------------------------------------
  DROPDOWN
  --------------------------------------------------------------------------- */

  var selectExEnv = document.querySelector('#selectExEnvOptions')
  selectExEnv.addEventListener('change', function (event) {
    if (!executionContextChange(selectExEnv.options[selectExEnv.selectedIndex].value)) {
      selectExEnv.value = executionContext
    }
  })

  selectExEnv.value = executionContext
}

module.exports = ExecutionContext
