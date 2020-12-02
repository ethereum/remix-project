import { hexConvert, hexListFromBNs, formatMemory } from '../util'
import { normalizeHexAddress } from '../helpers/uiHelper'
import { toChecksumAddress, BN, toBuffer } from 'ethereumjs-util'
import Web3 from 'web3'

export class Web3VmProvider {
  web3
  vm
  vmTraces
  txs
  txsReceipt
  processingHash
  processingAddress
  processingIndex
  previousDepth
  incr
  eth
  debug
  providers
  currentProvider
  storageCache
  lastProcessedStorageTxHash
  sha3Preimages
  sha3
  toHex
  toAscii
  fromAscii
  fromDecimal
  fromWei
  toWei
  toBigNumber
  isAddress
  utils

  constructor () {
    this.web3 = new Web3()
    this.vm = null
    this.vmTraces = {}
    this.txs = {}
    this.txsReceipt = {}
    this.processingHash = null
    this.processingAddress = null
    this.processingIndex = null
    this.previousDepth = 0
    this.incr = 0
    this.eth = {}
    this.debug = {}
    this.eth.getCode = this.getCode
    this.eth.getTransaction = this.getTransaction
    this.eth.getTransactionReceipt = this.getTransactionReceipt
    this.eth.getTransactionFromBlock = this.getTransactionFromBlock
    this.eth.getBlockNumber = this.getBlockNumber
    this.debug.traceTransaction = this.traceTransaction
    this.debug.storageRangeAt = this.storageRangeAt
    this.debug.preimage = this.preimage
    this.providers = { HttpProvider: function (url) {} }
    this.currentProvider = { host: 'vm provider' }
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

  setVM (vm) {
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

  releaseCurrentHash () {
    const ret = this.processingHash
    this.processingHash = undefined
    return ret
  }

  txWillProcess (self, data) {
    self.incr++
    self.processingHash = hexConvert(data.hash())
    self.vmTraces[self.processingHash] = {
      gas: '0x0',
      return: '0x0',
      structLogs: []
    }
    const tx = {}
    tx['hash'] = self.processingHash
    tx['from'] = toChecksumAddress(hexConvert(data.getSenderAddress()))
    if (data.to && data.to.length) {
      tx['to'] = toChecksumAddress(hexConvert(data.to))
    }
    this.processingAddress = tx['to']
    tx['data'] = hexConvert(data.data)
    tx['input'] = hexConvert(data.input)
    tx['gas'] = (new BN(hexConvert(data.gas).replace('0x', ''), 16)).toString(10)
    if (data.value) {
      tx['value'] = hexConvert(data.value)
    }
    self.txs[self.processingHash] = tx
    self.txsReceipt[self.processingHash] = tx
    self.storageCache[self.processingHash] = {}
    if (tx['to']) {
      const account = toBuffer(tx['to'])
      self.vm.stateManager.dumpStorage(account, (storage) => {
        self.storageCache[self.processingHash][tx['to']] = storage
        self.lastProcessedStorageTxHash[tx['to']] = self.processingHash
      })
    }
    this.processingIndex = 0
  }

  txProcessed (self, data) {
    const lastOp = self.vmTraces[self.processingHash].structLogs[self.processingIndex - 1]
    if (lastOp) {
      lastOp.error = lastOp.op !== 'RETURN' && lastOp.op !== 'STOP' && lastOp.op !== 'SELFDESTRUCT'
    }
    self.vmTraces[self.processingHash].gas = '0x' + data.gasUsed.toString(16)

    const logs = []
    for (const l in data.execResult.logs) {
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
      const address = hexConvert(data.createdAddress)
      self.vmTraces[self.processingHash].return = toChecksumAddress(address)
      self.txsReceipt[self.processingHash].contractAddress = toChecksumAddress(address)
    } else if (data.execResult.returnValue) {
      self.vmTraces[self.processingHash].return = hexConvert(data.execResult.returnValue)
    } else {
      self.vmTraces[self.processingHash].return = '0x'
    }
    this.processingIndex = null
    this.processingAddress = null
    this.previousDepth = 0
  }

  pushTrace (self, data) {
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
      stack: hexListFromBNs(data.stack),
      memory: formatMemory(data.memory),
      storage: data.storage,
      op: data.opcode.name,
      pc: data.pc,
      gasCost: data.opcode.fee.toString(),
      gas: data.gasLeft.toString(),
      depth: depth,
      error: data.error === false ? undefined : data.error
    }
    self.vmTraces[self.processingHash].structLogs.push(step)
    if (step.op === 'CREATE' || step.op === 'CALL') {
      if (step.op === 'CREATE') {
        this.processingAddress = '(Contract Creation - Step ' + this.processingIndex + ')'
        this.storageCache[this.processingHash][this.processingAddress] = {}
        this.lastProcessedStorageTxHash[this.processingAddress] = this.processingHash
      } else {
        this.processingAddress = normalizeHexAddress(step.stack[step.stack.length - 2])
        this.processingAddress = toChecksumAddress(this.processingAddress)
        if (!self.storageCache[self.processingHash][this.processingAddress]) {
          const account = toBuffer(this.processingAddress)
          self.vm.stateManager.dumpStorage(account, function (storage) {
            self.storageCache[self.processingHash][self.processingAddress] = storage
            self.lastProcessedStorageTxHash[self.processingAddress] = self.processingHash
          })
        }
      }
    }
    if (previousopcode && previousopcode.op === 'SHA3') {
      const preimage = this.getSha3Input(previousopcode.stack, previousopcode.memory)
      const imageHash = step.stack[step.stack.length - 1].replace('0x', '')
      self.sha3Preimages[imageHash] = {
        preimage: preimage
      }
    }

    this.processingIndex++
    this.previousDepth = depth
  }

  getCode (address, cb) {
    address = toChecksumAddress(address)
    const account = toBuffer(address)
    this.vm.stateManager.getContractCode(account, (error, result) => {
      cb(error, hexConvert(result))
    })
  }

  setProvider (provider) {}

  traceTransaction (txHash, options, cb) {
    if (this.vmTraces[txHash]) {
      if (cb) {
        cb(null, this.vmTraces[txHash])
      }
      return this.vmTraces[txHash]
    }
    if (cb) {
      cb('unable to retrieve traces ' + txHash, null)
    }
  }

  storageRangeAt (blockNumber, txIndex, address, start, maxLength, cb) { // txIndex is the hash in the case of the VM
    // we don't use the range params here
    address = toChecksumAddress(address)

    if (txIndex === 'latest') {
      txIndex = this.lastProcessedStorageTxHash[address]
    }

    if (this.storageCache[txIndex] && this.storageCache[txIndex][address]) {
      const storage = this.storageCache[txIndex][address]
      return cb(null, {
        storage: JSON.parse(JSON.stringify(storage)),
        nextKey: null
      })
    }
    cb('unable to retrieve storage ' + txIndex + ' ' + address)
  }

  getBlockNumber (cb) { cb(null, 'vm provider') }

  getTransaction (txHash, cb) {
    if (this.txs[txHash]) {
      if (cb) {
        cb(null, this.txs[txHash])
      }
      return this.txs[txHash]
    }
    if (cb) {
      cb('unable to retrieve tx ' + txHash, null)
    }
  }

  getTransactionReceipt (txHash, cb) {
    // same as getTransaction but return the created address also
    if (this.txsReceipt[txHash]) {
      if (cb) {
        cb(null, this.txsReceipt[txHash])
      }
      return this.txsReceipt[txHash]
    }
    if (cb) {
      cb('unable to retrieve txReceipt ' + txHash, null)
    }
  }

  getTransactionFromBlock (blockNumber, txIndex, cb) {
    const mes = 'not supposed to be needed by remix in vmmode'
    console.log(mes)
    if (cb) {
      cb(mes, null)
    }
  }

  preimage (hashedKey, cb) {
    hashedKey = hashedKey.replace('0x', '')
    cb(null, this.sha3Preimages[hashedKey] !== undefined ? this.sha3Preimages[hashedKey].preimage : null)
  }

  getSha3Input (stack, memory) {
    let memoryStart = stack[stack.length - 1]
    let memoryLength = stack[stack.length - 2]
    const memStartDec = (new BN(memoryStart.replace('0x', ''), 16)).toString(10)
    memoryStart = parseInt(memStartDec) * 2
    const memLengthDec = (new BN(memoryLength.replace('0x', ''), 16).toString(10))
    memoryLength = parseInt(memLengthDec) * 2

    let i = Math.floor(memoryStart / 32)
    const maxIndex = Math.floor(memoryLength / 32) + i
    if (!memory[i]) {
      return this.emptyFill(memoryLength)
    }
    let sha3Input = memory[i].slice(memoryStart - 32 * i)
    i++
    while (i < maxIndex) {
      sha3Input += memory[i] ? memory[i] : this.emptyFill(32)
      i++
    }
    if (sha3Input.length < memoryLength) {
      const leftSize = memoryLength - sha3Input.length
      sha3Input += memory[i] ? memory[i].slice(0, leftSize) : this.emptyFill(leftSize)
    }
    return sha3Input
  }

  emptyFill (size) {
    return (new Array(size)).join('0')
  }
}
