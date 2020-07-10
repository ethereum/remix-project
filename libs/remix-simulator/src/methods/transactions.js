const Web3 = require('web3')
const ethJSUtil = require('ethereumjs-util')
const processTx = require('./txProcess.js')
const BN = ethJSUtil.BN

const Transactions = function (executionContext) {
  this.executionContext = executionContext
}

Transactions.prototype.init = function (accounts) {
  this.accounts = accounts
}

Transactions.prototype.methods = function () {
  return {
    eth_sendTransaction: this.eth_sendTransaction.bind(this),
    eth_getTransactionReceipt: this.eth_getTransactionReceipt.bind(this),
    eth_getCode: this.eth_getCode.bind(this),
    eth_call: this.eth_call.bind(this),
    eth_estimateGas: this.eth_estimateGas.bind(this),
    eth_getTransactionCount: this.eth_getTransactionCount.bind(this),
    eth_getTransactionByHash: this.eth_getTransactionByHash.bind(this),
    eth_getTransactionByBlockHashAndIndex: this.eth_getTransactionByBlockHashAndIndex.bind(this),
    eth_getTransactionByBlockNumberAndIndex: this.eth_getTransactionByBlockNumberAndIndex.bind(this)
  }
}

Transactions.prototype.eth_sendTransaction = function (payload, cb) {
  // from might be lowercased address (web3)
  if (payload.params && payload.params.length > 0 && payload.params[0].from) {
    payload.params[0].from = ethJSUtil.toChecksumAddress(payload.params[0].from)
  }
  processTx(this.executionContext, this.accounts, payload, false, cb)
}

Transactions.prototype.eth_getTransactionReceipt = function (payload, cb) {
  this.executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
    if (error) {
      return cb(error)
    }

    const txBlock = this.executionContext.txs[receipt.hash]

    const r = {
      'transactionHash': receipt.hash,
      'transactionIndex': '0x00',
      'blockHash': '0x' + txBlock.hash().toString('hex'),
      'blockNumber': '0x' + txBlock.header.number.toString('hex'),
      'gasUsed': Web3.utils.toHex(receipt.gas),
      'cumulativeGasUsed': Web3.utils.toHex(receipt.gas),
      'contractAddress': receipt.contractAddress,
      'logs': receipt.logs,
      'status': receipt.status
    }

    if (r.blockNumber === '0x') {
      r.blockNumber = '0x0'
    }

    cb(null, r)
  })
}

Transactions.prototype.eth_estimateGas = function (payload, cb) {
  cb(null, 3000000)
}

Transactions.prototype.eth_getCode = function (payload, cb) {
  let address = payload.params[0]

  this.executionContext.web3().eth.getCode(address, (error, result) => {
    if (error) {
      console.dir('error getting code')
      console.dir(error)
    }
    cb(error, result)
  })
}

Transactions.prototype.eth_call = function (payload, cb) {
  // from might be lowercased address (web3)
  if (payload.params && payload.params.length > 0 && payload.params[0].from) {
    payload.params[0].from = ethJSUtil.toChecksumAddress(payload.params[0].from)
  }
  if (payload.params && payload.params.length > 0 && payload.params[0].to) {
    payload.params[0].to = ethJSUtil.toChecksumAddress(payload.params[0].to)
  }

  payload.params[0].value = undefined

  processTx(this.executionContext, this.accounts, payload, true, cb)
}

Transactions.prototype.eth_getTransactionCount = function (payload, cb) {
  let address = payload.params[0]

  this.executionContext.vm().stateManager.getAccount(address, (err, account) => {
    if (err) {
      return cb(err)
    }
    let nonce = new BN(account.nonce).toString(10)
    cb(null, nonce)
  })
}

Transactions.prototype.eth_getTransactionByHash = function (payload, cb) {
  const address = payload.params[0]

  this.executionContext.web3().eth.getTransactionReceipt(address, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    const txBlock = this.executionContext.txs[receipt.transactionHash]

    // TODO: params to add later
    const r = {
      'blockHash': '0x' + txBlock.hash().toString('hex'),
      'blockNumber': '0x' + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': Web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      'gasPrice': '0x4a817c800', // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      'value': receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
      // "v": "0x25", // 37
      // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
      // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === '0x') {
      r.value = '0x0'
    }

    if (r.blockNumber === '0x') {
      r.blockNumber = '0x0'
    }

    cb(null, r)
  })
}

Transactions.prototype.eth_getTransactionByBlockHashAndIndex = function (payload, cb) {
  const txIndex = payload.params[1]

  const txBlock = this.executionContext.blocks[payload.params[0]]
  const txHash = '0x' + txBlock.transactions[Web3.utils.toDecimal(txIndex)].hash().toString('hex')

  this.executionContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    // TODO: params to add later
    let r = {
      'blockHash': '0x' + txBlock.hash().toString('hex'),
      'blockNumber': '0x' + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': Web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      'gasPrice': '0x4a817c800', // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      'value': receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
      // "v": "0x25", // 37
      // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
      // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === '0x') {
      r.value = '0x0'
    }

    cb(null, r)
  })
}

Transactions.prototype.eth_getTransactionByBlockNumberAndIndex = function (payload, cb) {
  const txIndex = payload.params[1]

  const txBlock = this.executionContext.blocks[payload.params[0]]
  const txHash = '0x' + txBlock.transactions[Web3.utils.toDecimal(txIndex)].hash().toString('hex')

  this.executionContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    // TODO: params to add later
    const r = {
      'blockHash': '0x' + txBlock.hash().toString('hex'),
      'blockNumber': '0x' + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': Web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      'gasPrice': '0x4a817c800', // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      'value': receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
      // "v": "0x25", // 37
      // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
      // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === '0x') {
      r.value = '0x0'
    }

    cb(null, r)
  })
}

module.exports = Transactions
