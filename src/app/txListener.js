'use strict'
var async = require('async')
var ethJSABI = require('ethereumjs-abi')
var ethJSUtil = require('ethereumjs-util')
var EventManager = require('ethereum-remix').lib.EventManager
var remix = require('ethereum-remix')
var codeUtil = remix.util.code
var Web3VMProvider = remix.web3.web3VMProvider

/**
  * poll web3 each 2s if web3
  * listen on transaction executed event if VM
  * attention: blocks returned by the event `newBlock` have slightly different json properties whether web3 or the VM is used
  * trigger 'newBlock'
  *
  */
class TxListener {
  constructor (opt) {
    this.event = new EventManager()
    this._api = opt.api
    this._web3VMProvider = new Web3VMProvider() // TODO this should maybe be put in app.js
    this._web3VMProvider.setVM(opt.api.vm())
    this._resolvedTransactions = {}
    this._resolvedContracts = {}
    this._transactionReceipts = {}
    this.init()
    opt.event.executionContext.register('contextChanged', (context) => {
      if (this.loopId) {
        this.startListening(context)
      }
    })
    opt.event.udapp.register('transactionExecuted', (to, data, lookupOnly, txResult) => {
      if (this.loopId && this._api.isVM()) {
        this._web3VMProvider.getTransaction(txResult.transactionHash, (error, tx) => {
          if (error) return console.log(error)
          this._newBlock({
            type: 'VM',
            number: -1,
            transactions: [tx]
          })
        })
      }
    })
  }

  /**
    * reset recorded transactions
    */
  init () {
    this.blocks = []
    this.lastBlock = null
  }

  /**
    * start listening for incoming transactions
    *
    * @param {String} type - type/name of the provider to add
    * @param {Object} obj  - provider
    */
  startListening () {
    this.stopListening()
    this.init()
    if (this._api.context() === 'vm') {
      this.loopId = 'vm-listener'
    } else {
      this.loopId = setInterval(() => {
        this._api.web3().eth.getBlockNumber((error, blockNumber) => {
          if (error) return console.log(error)
          if (!this.lastBlock || blockNumber > this.lastBlock) {
            this.lastBlock = blockNumber
            this._api.web3().eth.getBlock(this.lastBlock, true, (error, result) => {
              if (!error) {
                this._newBlock(Object.assign({type: 'web3'}, result))
              }
            })
          }
        })
      }, 2)
    }
  }

  currentWeb3 () { // TODO this should maybe be put in app.js
    return this._api.isVM() ? this._web3VMProvider : this._api.web3()
  }

  /**
    * stop listening for incoming transactions. do not reset the recorded pool.
    *
    * @param {String} type - type/name of the provider to add
    * @param {Object} obj  - provider
    */
  stopListening () {
    if (this.loopId) {
      clearInterval(this.loopId)
    }
    this.loopId = null
  }

  /**
    * try to resolve the contract name from the given @arg address
    *
    * @param {String} address - contract address to resolve
    * @return {String} - contract name
    */
  resolvedContract (address) {
    return this._resolvedContracts[address]
  }

  /**
    * try to resolve the transaction from the given @arg txHash
    *
    * @param {String} txHash - contract address to resolve
    * @return {String} - contract name
    */
  resolvedTransaction (txHash) {
    return this._resolvedTransactions[txHash]
  }

  _newBlock (block) {
    this.blocks.push(block)
    this._resolve(block, () => {
      this.event.trigger('newBlock', [block])
    })
  }

  _resolve (block, callback) {
    async.each(block.transactions, (tx, cb) => {
      this._resolveTx(tx, (error, resolvedData) => {
        if (error) cb(error)
        if (resolvedData) this.event.trigger('txResolved', [tx, resolvedData])
        this.event.trigger('newTransaction', [tx])
        cb()
      })
    }, () => {
      callback()
    })
  }

  _resolveTx (tx, cb) {
    var contracts = this._api.contracts()
    if (!contracts) return cb()
    var contractName
    if (!tx.to) {
      // contract creation / resolve using the creation bytes code
      // if web3: we have to call getTransactionReceipt to get the created address
      // if VM: created address already included
      var code = tx.input
      contractName = this._tryResolveContract(code, contracts, 'bytecode')
      if (contractName) {
        this.resolveTransactionReceipt(tx, (error, receipt) => {
          if (error) return cb(error)
          var address = receipt.contractAddress
          this._resolvedContracts[address] = contractName
          var fun = this._resolveFunction(contractName, contracts, tx, true)
          if (this._resolvedTransactions[tx.hash]) {
            this._resolvedTransactions[tx.hash].contractAddress = address
          }
          return cb(null, {to: null, contractName: contractName, function: fun, creationAddress: address})
        })
        return
      }
      return cb()
    } else {
      // first check known contract, resolve against the `runtimeBytecode` if not known
      contractName = this._resolvedContracts[tx.to]
      if (!contractName) {
        this.currentWeb3().eth.getCode(tx.to, (error, code) => {
          if (error) return cb(error)
          if (code) {
            var contractName = this._tryResolveContract(code, contracts, 'runtimeBytecode')
            if (contractName) {
              this._resolvedContracts[tx.to] = contractName
              var fun = this._resolveFunction(contractName, contracts, tx, false)
              return cb(null, {to: tx.to, contractName: contractName, function: fun})
            }
          }
          return cb()
        })
        return
      }
      if (contractName) {
        var fun = this._resolveFunction(contractName, contracts, tx, false)
        return cb(null, {to: tx.to, contractName: contractName, function: fun})
      }
      return cb()
    }
  }

  resolveTransactionReceipt (tx, cb) {
    if (this._transactionReceipts[tx.hash]) {
      return cb(null, this._transactionReceipts[tx.hash])
    }
    this.currentWeb3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
      if (!error) {
        this._transactionReceipts[tx.hash] = receipt
        cb(null, receipt)
      } else {
        cb(error)
      }
    })
  }

  _resolveFunction (contractName, compiledContracts, tx, isCtor) {
    var abi = JSON.parse(compiledContracts[contractName].interface)
    var inputData = tx.input.replace('0x', '')
    if (!isCtor) {
      for (var fn in compiledContracts[contractName].functionHashes) {
        if (compiledContracts[contractName].functionHashes[fn] === inputData.substring(0, 8)) {
          this._resolvedTransactions[tx.hash] = {
            to: tx.to,
            fn: fn,
            params: this._decodeInputParams(inputData.substring(8), getFunction(abi, fn))
          }
          return
        }
      }
      // fallback function
      this._resolvedTransactions[tx.hash] = {
        to: tx.to,
        fn: '(fallback)',
        params: null
      }
    } else {
      var bytecode = compiledContracts[contractName].bytecode
      var params = null
      if (bytecode && bytecode.length) {
        params = this._decodeInputParams(inputData.substring(bytecode.length), getConstructorInterface(abi))
      }
      this._resolvedTransactions[tx.hash] = {
        to: null,
        fn: '(constructor)',
        params: params
      }
    }
    return this._resolvedTransactions[tx.hash]
  }

  _tryResolveContract (codeToResolve, compiledContracts, type) {
    for (var k in compiledContracts) {
      if (codeUtil.compareByteCode(codeToResolve, '0x' + compiledContracts[k][type])) {
        return k
      }
    }
    return null
  }

  _decodeInputParams (data, abi) {
    data = ethJSUtil.toBuffer('0x' + data)
    var inputTypes = []
    for (var i = 0; i < abi.inputs.length; i++) {
      inputTypes.push(abi.inputs[i].type)
    }
    return ethJSABI.rawDecode(inputTypes, data)
  }
}

// those function will be duplicate after the merged of the compile and run tabs split
function getConstructorInterface (abi) {
  var funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'outputs': [] }
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].type === 'constructor') {
      funABI.inputs = abi[i].inputs || []
      break
    }
  }

  return funABI
}

function getFunction (abi, fnName) {
  fnName = fnName.split('(')[0]
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].name === fnName) {
      return abi[i]
    }
  }
  return null
}

module.exports = TxListener
