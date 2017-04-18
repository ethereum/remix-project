'use strict'
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

module.exports = TraceRetriever
