'use strict'
function TraceRetriever (_web3) {
  this.web3 = _web3
  this.storages = {} // contains all intial storage (by addresses)
}

TraceRetriever.prototype.getTrace = function (txHash, callback) {
  var options = {
    disableStorage: this.debugStorageAtAvailable(),
    disableMemory: false,
    disableStack: false,
    fullStorage: !this.debugStorageAtAvailable()
  }
  this.web3.debug.traceTransaction(txHash, options, function (error, result) {
    callback(error, result)
  })
}

TraceRetriever.prototype.getStorage = function (tx, address, callback) {
  if (tx.to === '(Contract Creation Code)' || address.indexOf('(Contract Creation Code)') !== -1) {
    callback(null, {})
  } else if (this.storages[address]) {
    callback(null, this.storages[address])
  } else {
    var self = this
    this.web3.debug.storageAt(tx.blockNumber.toString(), tx.transactionIndex, address, function (error, result) {
      self.storages[address] = result
      callback(error, result)
    })
  }
}

TraceRetriever.prototype.debugStorageAtAvailable = function () {
  return true // storageAt not available if using geth
}

module.exports = TraceRetriever
