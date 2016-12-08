'use strict'
var traceHelper = require('../helpers/traceHelper')
var util = require('../helpers/global')

function TraceRetriever () {
}

TraceRetriever.prototype.getTrace = function (txHash, callback) {
  var options = {
    disableStorage: true,
    disableMemory: false,
    disableStack: false,
    fullStorage: false
  }
  util.web3.debug.traceTransaction(txHash, options, function (error, result) {
    callback(error, result)
  })
}

TraceRetriever.prototype.getStorage = function (tx, address, callback) {
  if (traceHelper.isContractCreation(address)) {
    callback(null, {})
  } else {
    if (util.web3.debug.storageRangeAt) {
      var end = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      var maxSize = 10000
      // The VM gives only a tx hash
      // TODO: get rid of that and use the range parameters
      util.web3.debug.storageRangeAt(tx.blockHash, tx.transactionIndex === undefined ? tx.hash : tx.transactionIndex, address, '0x0', '0x' + end, maxSize, function (error, result) {
        callback(error, result.storage)
      })
    } else {
      callback('no storageRangeAt endpoint found')
    }
  }
}

TraceRetriever.prototype.debugStorageAtAvailable = function () {
  return true
}

module.exports = TraceRetriever
