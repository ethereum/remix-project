'use strict'
var traceHelper = require('../src/helpers/traceHelper')
var traceInvokation = require('./resources/contractInvokationTrace')

function TestTraceRetriever () {
  this.storages = {} // contains all intial storage (by addresses)
}

TestTraceRetriever.prototype.getTrace = function (txHash, callback) {
  console.log(traceInvokation)
  callback(null, traceInvokation)
}

/* not used */
TestTraceRetriever.prototype.getStorage = function (tx, address, callback) {
  if (traceHelper.isContractCreation(address)) {
    callback(null, {})
  } else if (this.storages[address]) {
    callback(null, this.storages[address])
  } else {
    /*
        return storage
    */
    /*
        var self = this
        this.web3.debug.storageAt(tx.blockNumber.toString(), tx.transactionIndex, address, function (error, result) {
          self.storages[address] = result
          callback(error, result)
        })
    */
  }
}

TestTraceRetriever.prototype.debugStorageAtAvailable = function () {
  return false // storageAt not available if using geth
}

module.exports = TestTraceRetriever
