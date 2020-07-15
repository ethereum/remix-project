'use strict'

function TraceRetriever (options) {
  this.web3 = options.web3
}

TraceRetriever.prototype.getTrace = function (txHash, callback) {
  const options = {
    disableStorage: true,
    disableMemory: false,
    disableStack: false,
    fullStorage: false
  }
  this.web3.debug.traceTransaction(txHash, options, function (error, result) {
    callback(error, result)
  })
}

module.exports = TraceRetriever
