var util = require('../helpers/util')
var uiutil = require('../helpers/ui')
var traceHelper = require('../helpers/traceHelper')
var Web3 = require('web3')
var fees = require('ethereum-common')
var ethutil = require('ethereumjs-util')

function web3VmProvider () {
  var self = this
  this.web3 = new Web3()
  this.vm
  this.vmTraces = {}
  this.txs = {}
  this.processingHash
  this.processingAddress
  this.processingIndex
  this.incr = 0
  this.eth = {}
  this.debug = {}
  this.eth.getCode = function (address, cb) { return self.getCode(address, cb) }
  this.eth.getTransaction = function (hash, cb) { return self.getTransaction(hash, cb) }
  this.eth.getTransactionFromBlock = function (blockNumber, txIndex, cb) { return self.getTransactionFromBlock(blockNumber, txIndex, cb) }
  this.eth.getBlockNumber = function (cb) { return self.getBlockNumber(cb) }
  this.debug.traceTransaction = function (hash, options, cb) { return self.traceTransaction(hash, options, cb) }
  this.debug.storageRangeAt = function (blockNumber, txIndex, address, start, end, maxLength, cb) { return self.storageRangeAt(blockNumber, txIndex, address, start, end, maxLength, cb) }
  this.providers = { 'HttpProvider': function (url) {} }
  this.currentProvider = {'host': 'vm provider'}
  this.storageCache = {}
}

web3VmProvider.prototype.setVM = function (vm) {
  var self = this
  this.vm = vm
  this.vm.on('step', function (data) {
    self.pushTrace(self, data)
  })
  this.vm.on('afterTx', function (data) {
    self.txProcessed(self, data)
  })
  this.vm.on('beforeTx', function (data) {
    self.txWillProcess(self, data)
  })
}

web3VmProvider.prototype.releaseCurrentHash = function () {
  var ret = this.processingHash
  this.processingHash = undefined
  return ret
}

web3VmProvider.prototype.txWillProcess = function (self, data) {  
  self.incr++
  self.processingHash = util.hexConvert(data.hash())
  self.vmTraces[self.processingHash] = {
    gas: '0x0',
    return: '0x0',
    structLogs: []
  }
  var tx = {}
  tx.hash = self.processingHash
  tx.from = util.hexConvert(data.getSenderAddress())
  if (data.to && data.to.length) {
    tx.to = util.hexConvert(data.to)
  }
  this.processingAddress = tx.to
  tx.data = util.hexConvert(data.data)
  tx.input = util.hexConvert(data.input)
  tx.gas = util.hexConvert(data.gas)
  if (data.value) {
    tx.value = util.hexConvert(data.value)
  }
  self.txs[self.processingHash] = tx
  self.storageCache[self.processingHash] = {}
  if (tx.to) {
    self.vm.stateManager.dumpStorage(tx.to, function (storage) {
      self.storageCache[self.processingHash][tx.to] = storage
    })
  }
  this.processingIndex = 0
}

web3VmProvider.prototype.txProcessed = function (self, data) {
  self.vmTraces[self.processingHash].gas = '0x' + data.gasUsed.toString(16)
  if (data.createdAddress) {
    self.vmTraces[self.processingHash].return = util.hexConvert(data.createdAddress)
  } else {
    self.vmTraces[self.processingHash].return = util.hexConvert(data.vm.return)
  }
  this.processingIndex = null
  this.processingAddress = null
}

web3VmProvider.prototype.pushTrace = function (self, data) {
  if (!self.processingHash) {
    console.log('no tx processing')
    return
  }
  var step = {
    stack: util.hexListConvert(data.stack),
    memory: util.formatMemory(data.memory),
    storage: data.storage,
    op: data.opcode.name,
    pc: data.pc,
    gasCost: data.opcode.fee.toString(),
    gas: data.gasLeft.toString()
  }
  if (data.opcode.name === 'SSTORE') {
    var currentStorage = this.storageCache[this.processingHash][this.processingAddress]
    var key = step.stack[step.stack.length - 1]
    var value = step.stack[step.stack.length - 2]
    value = util.hexToIntArray(value)
    value = ethutil.unpad(value)
    if (value.length === 0) {
      data.opcode.fee = fees.sstoreResetGas.v
    } else if (currentStorage[key] === undefined) {
      data.opcode.fee = fees.sstoreSetGas.v
    } else {
      data.opcode.fee = fees.sstoreResetGas.v
    }
    step.gasCost = data.opcode.fee
  }
  self.vmTraces[self.processingHash].structLogs.push(step)
  if (traceHelper.newContextStorage(step)) {
    if (step.op === 'CREATE') {
      this.processingAddress = traceHelper.contractCreationToken(this.processingIndex)
      this.storageCache[this.processingHash][this.processingAddress] = {}
    } else {
      this.processingAddress = uiutil.normalizeHex(step.stack[step.stack.length - 2])
      if (!self.storageCache[self.processingHash][this.processingAddress]) {
        self.vm.stateManager.dumpStorage(this.processingAddress, function (storage) {
          self.storageCache[self.processingHash][this.processingAddress] = storage
        })
      }
    }
  }
  this.processingIndex++
}

web3VmProvider.prototype.getCode = function (address, cb) {
  this.vm.stateManager.getContractCode(address, function (error, result) {
    cb(error, util.hexConvert(result))
  })
}

web3VmProvider.prototype.setProvider = function (provider) {}

web3VmProvider.prototype.traceTransaction = function (txHash, options, cb) {
  if (this.vmTraces[txHash]) {
    if (cb) {
      cb(null, this.vmTraces[txHash])
    }
    return this.vmTraces[txHash]
  } else {
    if (cb) {
      cb('unable to retrieve traces ' + txHash, null)
    }
  }
}

web3VmProvider.prototype.storageRangeAt = function (blockNumber, txIndex, address, start, end, maxLength, cb) { // txIndex is the hash in the case of the VM
  // we don't use the range params here
  if (this.storageCache[txIndex] && this.storageCache[txIndex][address]) {
    var storage = this.storageCache[txIndex][address]
    return cb(null, {
      storage: JSON.parse(JSON.stringify(storage)), // copy
      complete: true
    })
  } else {
    cb('unable to retrieve storage ' + txIndex + ' ' + address)
  }
}

web3VmProvider.prototype.getBlockNumber = function (cb) { cb(null, 'vm provider') }

web3VmProvider.prototype.getTransaction = function (txHash, cb) {
  if (this.txs[txHash]) {
    if (cb) {
      cb(null, this.txs[txHash])
    }
    return this.txs[txHash]
  } else {
    if (cb) {
      cb('unable to retrieve tx ' + txHash, null)
    }
  }
}

web3VmProvider.prototype.getTransactionFromBlock = function (blockNumber, txIndex, cb) {
  var mes = 'not supposed to be needed by remix in vmmode'
  console.log(mes)
  if (cb) {
    cb(mes, null)
  }
}

module.exports = web3VmProvider
