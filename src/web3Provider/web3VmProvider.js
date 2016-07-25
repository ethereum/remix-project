var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

function web3VmProvider () {
  this.vm
  this.vmTraces = {}
  this.txs = {}
  this.processingHash
  this.incr = 0
}

var hexConvert = function (ints) {
  var ret = '0x'
  for (var i = 0; i < ints.length; i++) {
    try {
      var h = ints[i]
      if (h) {
        h = h.toString(16)
        ret += ('0x' + h) < 0x10 ? '0' + h : h
      } else {
        ret += '00'
      }
    } catch (e) {
      console.log('hexconvert ' + i + ' ' + ints.length)
      console.log(e)
    }
  }
  return ret
}

var hexListConvert = function (intsList) {
  var ret = []
  for (var k in intsList) {
    ret.push(hexConvert(intsList[k]))
  }
  return ret
}

var formatMemory = function (mem) {
  var hexMem = hexConvert(mem).substr(2)
  var ret = []
  for (var k = 0; k < hexMem.length; k += 32) {
    var row = hexMem.substr(k, 32)
    ret.push(row)
  }
  return ret
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
  tx.from = hexConvert(data.getSenderAddress())
  if (data.to && data.to.length) {
    tx.to = hexConvert(data.to)
  }
  tx.data = hexConvert(data.data)
  tx.input = hexConvert(data.input)
  tx.gas = hexConvert(data.gas)
  if (data.value) {
    tx.value = hexConvert(data.value)
  }
  self.txs[self.processingHash] = tx
}

web3VmProvider.prototype.txProcessed = function (self, data) {
  self.vmTraces[self.processingHash].gas = '0x' + data.gasUsed.toString(16)
  if (data.createdAddress) {
    self.vmTraces[self.processingHash].return = hexConvert(data.createdAddress)
  } else {
    self.vmTraces[self.processingHash].return = hexConvert(data.vm.return)
  }
}

web3VmProvider.prototype.pushTrace = function (self, data) {
  if (!self.processingHash) {
    console.log('no tx processing')
    return
  }
  var step = {
    stack: hexListConvert(data.stack),
    memory: formatMemory(data.memory),
    storage: data.storage,
    op: data.opcode.name,
    pc: data.pc,
    gas: data.opcode.fee.toString(),
    gasLeft: data.gasLeft.toString(),
    gasCost: self.vmTraces[self.processingHash].structLogs.length > 0 ? ((new BN(self.vmTraces[self.processingHash].structLogs[0].gasLeft)) - data.gasLeft).toString() : data.opcode.fee.toString()
  }
  self.vmTraces[self.processingHash].structLogs.push(step)
}

web3VmProvider.prototype.getCode = function (address, cb) {
  this.vm.stateManager.getContractCode(address, function (error, result) {
    cb(error, hexConvert(result))
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
    var mes = 'unable to retrieve traces ' + txHash
    if (cb) {
      cb('unable to retrieve traces ' + txHash, null)
    }
    throw mes
  }
}

web3VmProvider.prototype.storageAt = function (blockNumber, txIndex, address, cb) { cb(null, {}) }

web3VmProvider.prototype.getTransaction = function (txHash, cb) {
  if (this.txs[txHash]) {
    if (cb) {
      cb(null, this.txs[txHash])
    }
    return this.txs[txHash]
  } else {
    var mes = 'unable to retrieve tx ' + txHash
    if (cb) {
      cb('unable to retrieve tx ' + txHash, null)
    }
    throw mes
  }
}

web3VmProvider.prototype.getTransactionFromBlock = function (blockNumber, txIndex, cb) {
  var mes = 'not supposed to be needed by remix'
  console.log(mes)
  if (cb) {
    cb(mes, null)
  }
  throw mes
}

module.exports = web3VmProvider
