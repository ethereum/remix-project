'use strict'
var async = require('async')
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
    this._appAPI = opt.appAPI
    this._web3VMProvider = new Web3VMProvider() // TODO this should maybe be put in app.js
    this._web3VMProvider.setVM(opt.appAPI.vm())
    this._resolvedTransactions = {}
    this._resolvedContracts = {}
    this.init()
    opt.appEvent.executionContext.register('contextChanged', (context) => {
      if (this.loopId) {
        this.startListening(context)
      }
    })
    opt.appEvent.udapp.register('transactionExecuted', (to, data, lookupOnly, txResult) => {
      if (this.loopId && this._appAPI.isVM()) {
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
    if (this._appAPI.context() === 'vm') {
      this.loopId = 'vm-listener'
    } else {
      this.loopId = setInterval(() => {
        this._appAPI.web3().eth.getBlockNumber((error, blockNumber) => {
          if (error) return console.log(error)
          if (!this.lastBlock || blockNumber > this.lastBlock) {
            this.lastBlock = blockNumber
            this._appAPI.web3().eth.getBlock(this.lastBlock, true, (error, result) => {
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
    return this._appAPI.isVM() ? this._web3VMProvider : this._appAPI.web3()
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
      this._resolveTx(tx, cb)
    }, () => {
      callback()
    })
  }

  _resolveTx (tx, cb) {
    var contracts = this._appAPI.contracts()
    if (!contracts) return cb()
    var contractName
    if (!tx.to) {
      // contract creation / resolve using the creation bytes code
      // if web3: we have to call getTransactionReceipt to get the created address
      // if VM: created address already included
      var code = tx.input
      contractName = this._tryResolveContract(code, contracts, 'bytecode')
      if (contractName) {
        this._resolveCreationAddress(tx, (error, address) => {
          if (error) return cb(error)
          this._resolvedContracts[address] = contractName
          this._resolveFunction(contractName, contracts, tx, true)
          if (this._resolvedTransactions[tx.hash]) {
            this._resolvedTransactions[tx.hash].contractAddress = address
          }
          return cb()
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
              this._resolveFunction(contractName, contracts, tx, false)
              return cb()
            }
            return cb()
          }
          return cb()
        })
        return
      }
      if (contractName) {
        this._resolveFunction(contractName, contracts, tx, false)
        return cb()
      }
      return cb()
    }
  }

  _resolveCreationAddress (tx, cb) {
    this.currentWeb3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
      if (!error) {
        cb(null, receipt.contractAddress)
      } else {
        cb(error)
      }
    })
  }

  _resolveFunction (contractName, compiledContracts, tx, isCtor) {
    if (!isCtor) {
      for (var fn in compiledContracts[contractName].functionHashes) {
        if (compiledContracts[contractName].functionHashes[fn] === tx.input.replace('0x', '').substring(0, 8)) {
          this._resolvedTransactions[tx.hash] = {
            to: tx.to,
            fn: fn,
            params: null
          }
        }
      // fallback function
      this._resolvedTransactions[tx.hash] = {
        to: tx.to,
        fn: '(fallback)',
        params: null
      }
    } else {
      this._resolvedTransactions[tx.hash] = {
        to: null,
        fn: '(constructor)',
        params: null
      }
    }
  }

  _tryResolveContract (codeToResolve, compiledContracts, type) {
    for (var k in compiledContracts) {
      if (codeUtil.compareByteCode(codeToResolve, '0x' + compiledContracts[k][type])) {
        return k
      }
    }
    return null
  }
}

module.exports = TxListener
