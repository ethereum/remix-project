const util = require('../util')
const uiutil = require('../helpers/uiHelper')
const traceHelper = require('../helpers/traceHelper')
const ethutil = require('ethereumjs-util')
const Web3 = require('web3')

function web3VmProvider () {
  this.web3 = new Web3()
  this.vm
  this.vmTraces = {}
  this.txs = {}
  this.txsReceipt = {}
  this.processingHash
  this.processingAddress
  this.processingIndex
  this.previousDepth = 0
  this.incr = 0
  this.eth = {}
  this.debug = {}
  this.eth.getCode = (...args) => this.getCode(...args)
  this.eth.getTransaction = (...args) => this.getTransaction(...args)
  this.eth.getTransactionReceipt = (...args) => this.getTransactionReceipt(...args)
  this.eth.getTransactionFromBlock = (...args) => this.getTransactionFromBlock(...args)
  this.eth.getBlockNumber = (...args) => this.getBlockNumber(...args)
  this.debug.traceTransaction = (...args) => this.traceTransaction(...args)
  this.debug.storageRangeAt = (...args) => this.storageRangeAt(...args)
  this.debug.preimage = (...args) => this.preimage(...args)
  this.providers = { 'HttpProvider': function (url) {} }
  this.currentProvider = {'host': 'vm provider'}
  this.storageCache = {}
  this.lastProcessedStorageTxHash = {}
  this.sha3Preimages = {}
  // util
  this.sha3 = (...args) => this.web3.utils.sha3(...args)
  this.toHex = (...args) => this.web3.utils.toHex(...args)
  this.toAscii = (...args) => this.web3.utils.hexToAscii(...args)
  this.fromAscii = (...args) => this.web3.utils.asciiToHex(...args)
  this.fromDecimal = (...args) => this.web3.utils.numberToHex(...args)
  this.fromWei = (...args) => this.web3.utils.fromWei(...args)
  this.toWei = (...args) => this.web3.utils.toWei(...args)
  this.toBigNumber = (...args) => this.web3.utils.toBN(...args)
  this.isAddress = (...args) => this.web3.utils.isAddress(...args)
  this.utils = Web3.utils || []
}

web3VmProvider.prototype.setVM = function (vm) {
  if (this.vm === vm) return
  this.vm = vm
  this.vm.on('step', (data) => {
    this.pushTrace(this, data)
  })
  this.vm.on('afterTx', (data) => {
    this.txProcessed(this, data)
  })
  this.vm.on('beforeTx', (data) => {
    this.txWillProcess(this, data)
  })
}

web3VmProvider.prototype.releaseCurrentHash = function () {
  const ret = this.processingHash
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
  let tx = {}
  tx.hash = self.processingHash
  tx.from = util.hexConvert(data.getSenderAddress())
  if (data.to && data.to.length) {
    tx.to = util.hexConvert(data.to)
  }
  this.processingAddress = tx.to
  tx.data = util.hexConvert(data.data)
  tx.input = util.hexConvert(data.input)
  tx.gas = (new ethutil.BN(util.hexConvert(data.gas).replace('0x', ''), 16)).toString(10)
  if (data.value) {
    tx.value = util.hexConvert(data.value)
  }
  self.txs[self.processingHash] = tx
  self.txsReceipt[self.processingHash] = tx
  self.storageCache[self.processingHash] = {}
  if (tx.to) {
    const account = ethutil.toBuffer(tx.to)
    self.vm.stateManager.dumpStorage(account, (storage) => {
      self.storageCache[self.processingHash][tx.to] = storage
      self.lastProcessedStorageTxHash[tx.to] = self.processingHash
    })
  }
  this.processingIndex = 0
}

web3VmProvider.prototype.txProcessed = function (self, data) {
  const lastOp = self.vmTraces[self.processingHash].structLogs[self.processingIndex - 1]
  if (lastOp) {
    lastOp.error = lastOp.op !== 'RETURN' && lastOp.op !== 'STOP' && lastOp.op !== 'SELFDESTRUCT'
  }
  self.vmTraces[self.processingHash].gas = '0x' + data.gasUsed.toString(16)

  const logs = []
  for (let l in data.execResult.logs) {
    const log = data.execResult.logs[l]
    const topics = []
    if (log[1].length > 0) {
      for (var k in log[1]) {
        topics.push('0x' + log[1][k].toString('hex'))
      }
    } else {
      topics.push('0x')
    }
    logs.push({
      address: '0x' + log[0].toString('hex'),
      data: '0x' + log[2].toString('hex'),
      topics: topics,
      rawVMResponse: log
    })
  }
  self.txsReceipt[self.processingHash].logs = logs
  self.txsReceipt[self.processingHash].transactionHash = self.processingHash
  const status = data.execResult.exceptionError ? 0 : 1
  self.txsReceipt[self.processingHash].status = `0x${status}`

  if (data.createdAddress) {
    const address = util.hexConvert(data.createdAddress)
    self.vmTraces[self.processingHash].return = address
    self.txsReceipt[self.processingHash].contractAddress = address
  } else if (data.execResult.returnValue) {
    self.vmTraces[self.processingHash].return = util.hexConvert(data.execResult.returnValue)
  } else {
    self.vmTraces[self.processingHash].return = '0x'
  }
  this.processingIndex = null
  this.processingAddress = null
  this.previousDepth = 0
}

web3VmProvider.prototype.pushTrace = function (self, data) {
  const depth = data.depth + 1 // geth starts the depth from 1
  if (!self.processingHash) {
    console.log('no tx processing')
    return
  }
  let previousopcode
  if (self.vmTraces[self.processingHash] && self.vmTraces[self.processingHash].structLogs[this.processingIndex - 1]) {
    previousopcode = self.vmTraces[self.processingHash].structLogs[this.processingIndex - 1]
  }

  if (this.previousDepth > depth && previousopcode) {
    // returning from context, set error it is not STOP, RETURN
    previousopcode.invalidDepthChange = previousopcode.op !== 'RETURN' && previousopcode.op !== 'STOP'
  }
  const step = {
    stack: util.hexListFromBNs(data.stack),
    memory: util.formatMemory(data.memory),
    storage: data.storage,
    op: data.opcode.name,
    pc: data.pc,
    gasCost: data.opcode.fee.toString(),
    gas: data.gasLeft.toString(),
    depth: depth,
    error: data.error === false ? undefined : data.error
  }
  self.vmTraces[self.processingHash].structLogs.push(step)
  if (traceHelper.newContextStorage(step)) {
    if (step.op === 'CREATE') {
      this.processingAddress = traceHelper.contractCreationToken(this.processingIndex)
      this.storageCache[this.processingHash][this.processingAddress] = {}
      this.lastProcessedStorageTxHash[this.processingAddress] = this.processingHash
    } else {
      this.processingAddress = uiutil.normalizeHexAddress(step.stack[step.stack.length - 2])
      if (!self.storageCache[self.processingHash][this.processingAddress]) {
        const account = ethutil.toBuffer(this.processingAddress)
        self.vm.stateManager.dumpStorage(account, function (storage) {
          self.storageCache[self.processingHash][self.processingAddress] = storage
          self.lastProcessedStorageTxHash[self.processingAddress] = self.processingHash
        })
      }
    }
  }
  if (previousopcode && traceHelper.isSHA3Instruction(previousopcode)) {
    const preimage = getSha3Input(previousopcode.stack, previousopcode.memory)
    const imageHash = step.stack[step.stack.length - 1].replace('0x', '')
    self.sha3Preimages[imageHash] = {
      'preimage': preimage
    }
  }

  this.processingIndex++
  this.previousDepth = depth
}

web3VmProvider.prototype.getCode = function (address, cb) {
  const account = ethutil.toBuffer(address)
  this.vm.stateManager.getContractCode(account, (error, result) => {
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

web3VmProvider.prototype.storageRangeAt = function (blockNumber, txIndex, address, start, maxLength, cb) { // txIndex is the hash in the case of the VM
  // we don't use the range params here

  if (txIndex === 'latest') {
    txIndex = this.lastProcessedStorageTxHash[address]
  }

  if (this.storageCache[txIndex] && this.storageCache[txIndex][address]) {
    const storage = this.storageCache[txIndex][address]
    return cb(null, {
      storage: JSON.parse(JSON.stringify(storage)),
      nextKey: null
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

web3VmProvider.prototype.getTransactionReceipt = function (txHash, cb) {
  // same as getTransaction but return the created address also
  if (this.txsReceipt[txHash]) {
    if (cb) {
      cb(null, this.txsReceipt[txHash])
    }
    return this.txsReceipt[txHash]
  } else {
    if (cb) {
      cb('unable to retrieve txReceipt ' + txHash, null)
    }
  }
}

web3VmProvider.prototype.getTransactionFromBlock = function (blockNumber, txIndex, cb) {
  const mes = 'not supposed to be needed by remix in vmmode'
  console.log(mes)
  if (cb) {
    cb(mes, null)
  }
}

web3VmProvider.prototype.preimage = function (hashedKey, cb) {
  hashedKey = hashedKey.replace('0x', '')
  cb(null, this.sha3Preimages[hashedKey] !== undefined ? this.sha3Preimages[hashedKey].preimage : null)
}

function getSha3Input (stack, memory) {
  let memoryStart = stack[stack.length - 1]
  let memoryLength = stack[stack.length - 2]
  const memStartDec = (new ethutil.BN(memoryStart.replace('0x', ''), 16)).toString(10)
  memoryStart = parseInt(memStartDec) * 2
  const memLengthDec = (new ethutil.BN(memoryLength.replace('0x', ''), 16).toString(10))
  memoryLength = parseInt(memLengthDec) * 2

  let i = Math.floor(memoryStart / 32)
  const maxIndex = Math.floor(memoryLength / 32) + i
  if (!memory[i]) {
    return emptyFill(memoryLength)
  }
  let sha3Input = memory[i].slice(memoryStart - 32 * i)
  i++
  while (i < maxIndex) {
    sha3Input += memory[i] ? memory[i] : emptyFill(32)
    i++
  }
  if (sha3Input.length < memoryLength) {
    const leftSize = memoryLength - sha3Input.length
    sha3Input += memory[i] ? memory[i].slice(0, leftSize) : emptyFill(leftSize)
  }
  return sha3Input
}

function emptyFill (size) {
  return (new Array(size)).join('0')
}

module.exports = web3VmProvider
