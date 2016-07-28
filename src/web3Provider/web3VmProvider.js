var ethJSUtil = require('ethereumjs-util')
var util = require('../helpers/util')

function web3VmProvider () {
  var self = this
  this.vm
  this.vmTraces = {}
  this.txs = {}
  this.processingHash
  this.incr = 0
  this.eth = {}
  this.debug = {}
  this.eth.getCode = function (address, cb) { return self.getCode(address, cb) }
  this.eth.getTransaction = function (hash, cb) { return self.getTransaction(hash, cb) }
  this.eth.getTransactionFromBlock = function (blockNumber, txIndex, cb) { return self.getTransactionFromBlock(blockNumber, txIndex, cb) }
  this.eth.getBlockNumber = function (cb) { return self.getBlockNumber(cb) }
  this.debug.traceTransaction = function (hash, options, cb) { return self.traceTransaction(hash, options, cb) }
  this.debug.storageAt = function (blockNumber, txIndex, address, cb) { return self.storageAt(blockNumber, txIndex, address, cb) }
  this.providers = { 'HttpProvider': function (url) {} }
  this.currentProvider = {'host': 'vm provider'}
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
  self.processingHash = '0x' + ethJSUtil.sha3([data.r, data.s, data.v, self.incr]).join('')
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
  tx.data = util.hexConvert(data.data)
  tx.input = util.hexConvert(data.input)
  tx.gas = util.hexConvert(data.gas)
  if (data.value) {
    tx.value = util.hexConvert(data.value)
  }
  self.txs[self.processingHash] = tx
}

web3VmProvider.prototype.txProcessed = function (self, data) {
  self.vmTraces[self.processingHash].gas = '0x' + data.gasUsed.toString(16)
  if (data.createdAddress) {
    self.vmTraces[self.processingHash].return = util.hexConvert(data.createdAddress)
  } else {
    self.vmTraces[self.processingHash].return = util.hexConvert(data.vm.return)
  }
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
  self.vmTraces[self.processingHash].structLogs.push(step)
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

web3VmProvider.prototype.storageAt = function (blockNumber, txIndex, address, cb) { cb(null, {}) }

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
