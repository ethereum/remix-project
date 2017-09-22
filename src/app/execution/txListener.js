'use strict'
var async = require('async')
var ethJSABI = require('ethereumjs-abi')
var ethJSUtil = require('ethereumjs-util')
var EventManager = require('ethereum-remix').lib.EventManager
var remix = require('ethereum-remix')
var codeUtil = remix.util.code
var executionContext = require('../../execution-context')
var txFormat = require('./txFormat')

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
    this._resolvedTransactions = {}
    this._resolvedContracts = {}
    this._isListening = false
    this._listenOnNetwork = false
    this._loopId = null
    this.init()
    executionContext.event.register('contextChanged', (context) => {
      if (this._isListening) {
        this.stopListening()
        this.startListening()
      }
    })

    opt.event.udapp.register('callExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (error) return
      // we go for that case if
      // in VM mode
      // in web3 mode && listen remix txs only
      if (!this._isListening) return // we don't listen
      if (this._loopId && executionContext.getProvider() !== 'vm') return // we seems to already listen on a "web3" network

      var call = {
        from: from,
        to: to,
        input: data,
        hash: txResult.transactionHash ? txResult.transactionHash : 'call' + from + to + data,
        isCall: true,
        output: txResult.result,
        returnValue: executionContext.isVM() ? txResult.result.vm.return : ethJSUtil.toBuffer(txResult.result),
        envMode: executionContext.getProvider()
      }
      this._resolveTx(call, (error, resolvedData) => {
        if (!error) {
          this.event.trigger('newCall', [call])
        }
      })
    })

    opt.event.udapp.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (error) return
      if (lookupOnly) return
      // we go for that case if
      // in VM mode
      // in web3 mode && listen remix txs only
      if (!this._isListening) return // we don't listen
      if (this._loopId && executionContext.getProvider() !== 'vm') return // we seems to already listen on a "web3" network
      executionContext.web3().eth.getTransaction(txResult.transactionHash, (error, tx) => {
        if (error) return console.log(error)
        if (txResult && txResult.result) {
          if (txResult.result.vm) {
            tx.returnValue = txResult.result.vm.return
            if (txResult.result.vm.gasUsed) tx.executionCost = txResult.result.vm.gasUsed.toString(10)
          }
          if (txResult.result.gasUsed) tx.transactionCost = txResult.result.gasUsed.toString(10)
        }

        tx.envMode = executionContext.getProvider()
        this._resolve([tx], () => {
        })
      })
    })
  }

  /**
    * define if txlistener should listen on the network or if only tx created from remix are managed
    *
    * @param {Bool} type - true if listen on the network
    */
  setListenOnNetwork (listenOnNetwork) {
    this._listenOnNetwork = listenOnNetwork
    if (this._loopId) {
      clearInterval(this._loopId)
    }
    if (this._listenOnNetwork) {
      this._startListenOnNetwork()
    }
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
    this.init()
    this._isListening = true
    if (this._listenOnNetwork && executionContext.getProvider() !== 'vm') {
      this._startListenOnNetwork()
    }
  }

   /**
    * stop listening for incoming transactions. do not reset the recorded pool.
    *
    * @param {String} type - type/name of the provider to add
    * @param {Object} obj  - provider
    */
  stopListening () {
    if (this._loopId) {
      clearInterval(this._loopId)
    }
    this._loopId = null
    this._isListening = false
  }

  _startListenOnNetwork () {
    this._loopId = setInterval(() => {
      var currentLoopId = this._loopId
      executionContext.web3().eth.getBlockNumber((error, blockNumber) => {
        if (this._loopId === null) return
        if (error) return console.log(error)
        if (currentLoopId === this._loopId && (!this.lastBlock || blockNumber > this.lastBlock)) {
          if (!this.lastBlock) this.lastBlock = blockNumber - 1
          var current = this.lastBlock + 1
          this.lastBlock = blockNumber
          while (blockNumber >= current) {
            try {
              this._manageBlock(current)
            } catch (e) {
              console.log(e)
            }
            current++
          }
        }
      })
    }, 2000)
  }

  _manageBlock (blockNumber) {
    executionContext.web3().eth.getBlock(blockNumber, true, (error, result) => {
      if (!error) {
        this._newBlock(Object.assign({type: 'web3'}, result))
      }
    })
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
    this._resolve(block.transactions, () => {
      this.event.trigger('newBlock', [block])
    })
  }

  _resolve (transactions, callback) {
    async.each(transactions, (tx, cb) => {
      this._resolveTx(tx, (error, resolvedData) => {
        if (error) cb(error)
        if (resolvedData) {
          this.event.trigger('txResolved', [tx, resolvedData])
        }
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
        this._api.resolveReceipt(tx, (error, receipt) => {
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
        executionContext.web3().eth.getCode(tx.to, (error, code) => {
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

  _resolveFunction (contractName, compiledContracts, tx, isCtor) {
    var abi = JSON.parse(compiledContracts[contractName].interface)
    var inputData = tx.input.replace('0x', '')
    if (!isCtor) {
      for (var fn in compiledContracts[contractName].functionHashes) {
        if (compiledContracts[contractName].functionHashes[fn] === inputData.substring(0, 8)) {
          var fnabi = getFunction(abi, fn)
          this._resolvedTransactions[tx.hash] = {
            contractName: contractName,
            to: tx.to,
            fn: fn,
            params: this._decodeInputParams(inputData.substring(8), fnabi)
          }
          if (tx.returnValue) {
            this._resolvedTransactions[tx.hash].decodedReturnValue = txFormat.decodeResponse(tx.returnValue, fnabi)
          }
          return this._resolvedTransactions[tx.hash]
        }
      }
      // fallback function
      this._resolvedTransactions[tx.hash] = {
        contractName: contractName,
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
        contractName: contractName,
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
    var decoded = ethJSABI.rawDecode(inputTypes, data)
    decoded = ethJSABI.stringify(inputTypes, decoded)
    var ret = {}
    for (var k in abi.inputs) {
      ret[abi.inputs[k].type + ' ' + abi.inputs[k].name] = decoded[k]
    }
    return ret
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
