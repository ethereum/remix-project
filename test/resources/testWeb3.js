'use strict'
var init = require('../init')
var web3Override = {}
var data = init.readFile(require('path').resolve(__dirname, 'testWeb3.json'))
var data = JSON.parse(data)

web3Override.getCode = function (address, callback) {
  if (callback) {
    callback(null, data.testCodes[address])
  } else {
    return data.testCodes[address]
  }
}

web3Override.traceTransaction = function (txHash, options, callback) {
  callback(null, data.testTraces[txHash])
}

web3Override.storageAt = function (blockNumber, txIndex, address, callback) {
  callback(null, {})
}

web3Override.getTransaction = function (txHash, callback) {
  if (callback) {
    callback(null, data.testTxs[txHash])
  } else {
    return data.testTxs[txHash]
  }
}

web3Override.getTransactionFromBlock = function (blockNumber, txIndex, callback) {
  if (callback) {
    callback(null, data.testTxsByBlock[blockNumber + '-' + txIndex])
  } else {
    return data.testTxsByBlock[blockNumber + '-' + txIndex]
  }
}

web3Override.getBlockNumber = function (callback) { callback('web3 modified testing purposes :)') }

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = web3Override
}
