var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext
var ethJSUtil = require('ethereumjs-util')
var processTx = require('./txProcess.js')
var BN = ethJSUtil.BN

function hexConvert (ints) {
  var ret = '0x'
  for (var i = 0; i < ints.length; i++) {
    var h = ints[i]
    if (h) {
      ret += (h <= 0xf ? '0' : '') + h.toString(16)
    } else {
      ret += '00'
    }
  }
  return ret
}

var Transactions = function (accounts) {
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
    eth_getTransactionByHash: this.eth_getTransactionByHash.bind(this)
  }
}

Transactions.prototype.eth_sendTransaction = function (payload, cb) {
  processTx(this.accounts, payload, false, cb)
}

Transactions.prototype.eth_getTransactionReceipt = function (payload, cb) {
  executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
    if (error) {
      return cb(error)
    }

    var r = {
      'transactionHash': receipt.hash,
      'transactionIndex': '0x00',
      'blockHash': '0x766d18646a06cf74faeabf38597314f84a82c3851859d9da9d94fc8d037269e5',
      'blockNumber': '0x06',
      'gasUsed': '0x06345f',
      'cumulativeGasUsed': '0x06345f',
      'contractAddress': receipt.contractAddress,
      'logs': receipt.logs,
      'status': receipt.status
    }

    cb(null, r)
  })
}

Transactions.prototype.eth_estimateGas = function (payload, cb) {
  cb(null, 3000000)
}

Transactions.prototype.eth_getCode = function (payload, cb) {
  let address = payload.params[0]

  const account = ethJSUtil.toBuffer(address)

  executionContext.vm().stateManager.getContractCode(account, (error, result) => {
    cb(error, hexConvert(result))
  })
}

Transactions.prototype.eth_call = function (payload, cb) {
  processTx(this.accounts, payload, true, cb)
}

Transactions.prototype.eth_getTransactionCount = function (payload, cb) {
  let address = payload.params[0]

  executionContext.vm().stateManager.getAccount(address, (err, account) => {
    if (err) {
      return cb(err)
    }
    let nonce = new BN(account.nonce).toString(10)
    cb(null, nonce)
  })
}

Transactions.prototype.eth_getTransactionByHash = function (payload, cb) {
  const address = payload.params[0]

  executionContext.web3().eth.getTransactionReceipt(address, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    // executionContext.web3().eth.getBlock(receipt.hash).then((block) => {
    const r = {
      'hash': receipt.transactionHash,
      // "nonce": 2,
      'blockHash': receipt.hash,
      // 'blockNumber': block.number,
      // "transactionIndex": 0,
      'from': receipt.from,
      'to': receipt.to,
      'value': receipt.value,
      'gas': receipt.gas,
      'gasPrice': '2000000000000',
      'input': receipt.input
    }

    cb(null, r)
    // })
  })
}

module.exports = Transactions
