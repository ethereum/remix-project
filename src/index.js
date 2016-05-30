'use strict'
var ReactDOM = require('react-dom')
var React = require('react')
var Web3 = require('web3')
var Web3Admin = require('./web3Admin')
var TraceManager = require('./traceManager')
var CodeManager = require('./codeManager')

function loadContext () {
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

var Debugger = require('./debugger')

ReactDOM.render(
  <Debugger context={loadContext()} />,
  document.getElementById('app')
)
