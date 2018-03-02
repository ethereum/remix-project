'use strict'
var remixLib = require('remix-lib')
var global = remixLib.global

function TraceRetriever () {
}

TraceRetriever.prototype.getTrace = function (txHash, callback) {
  var options = {
    disableStorage: true,
    disableMemory: false,
    disableStack: false,
    fullStorage: false
  }
  global.web3Debug.debug.traceTransaction(txHash, options, function (error, result) {
    callback(error, result)
  })
}

module.exports = TraceRetriever
