'use strict'
var traceHelper = require('../helpers/traceHelper')

function TraceRetriever (_web3) {
  this.web3 = _web3
  this.storages = {} // contains all intial storage (by addresses)
}

TraceRetriever.prototype.getTrace = function (txHash, callback) {
  var options = {
    disableStorage: true,
    disableMemory: false,
    disableStack: false,
    fullStorage: false
  }
  this.web3.debug.traceTransaction(txHash, options, function (error, result) {
    callback(error, result)
  })
}

TraceRetriever.prototype.getStorage = function (tx, address, callback) {
  if (traceHelper.isContractCreation(address)) {
    callback(null, {})
  } else if (this.storages[address]) {
    callback(null, this.storages[address])
  } else {
    // we always return an empty storage ... storage changes will be displayed instead of the full contract storage
    callback(null, {})
    /*
    var self = this
    this.web3.debug.storageAt(tx.blockNumber.toString(), tx.transactionIndex, address, function (error, result) {
      self.storages[address] = result
      callback(error, result)
    })
    */
  }
}

TraceRetriever.prototype.debugStorageAtAvailable = function () {
  return false  // this.web3.version.node.toLowerCase().indexOf('geth') === -1 // storageAt not available if using geth
}

module.exports = TraceRetriever
