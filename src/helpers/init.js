'use strict'
var Web3 = require('web3')
var Web3Admin = require('../util/web3Admin')
var TraceManager = require('../trace/traceManager')
var CodeManager = require('../code/codeManager')

module.exports = {
  loadContext: function () {
    var web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
    Web3Admin.extend(web3)
    var traceManager = new TraceManager(web3)
    return {
      web3: web3,
      traceManager: traceManager,
      codeManager: new CodeManager(web3, traceManager)
    }
  }
}
