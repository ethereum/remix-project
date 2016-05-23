'use strict'
function TraceRetriever (_web3) {
  this.web3 = _web3
  this.storages = {} // contains all intial storage (by addresses)
}

TraceRetriever.prototype.getTrace = function (blockNumber, txNumber, callback) {
  this.web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
    callback(error, result)
  })
}

TraceRetriever.prototype.getStorage = function (blockNumber, txIndex, address, callback) {
  if (this.storages[address]) {
    callback(null, this.storages[address])
  } else {
    var self = this
    this.web3.debug.storageAt(blockNumber, txIndex, address, function (error, result) {
      self.storages[address] = result
      callback(error, result)
    })
  }
}

module.exports = TraceRetriever
