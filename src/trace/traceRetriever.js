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
    util.web3.debug.storageAt(null, tx.hash, address, function (error, result) {
      callback(error, result)
    })
  }
}

TraceRetriever.prototype.debugStorageAtAvailable = function () {
  return true
}

module.exports = TraceRetriever
