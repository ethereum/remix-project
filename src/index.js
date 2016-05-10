'use strict'
var ReactDOM = require('react-dom')
var React = require('react')
var Web3 = require('web3')
var Web3Admin = require('./web3Admin')

function loadWeb3 () {
  var web3 = new Web3()
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
  Web3Admin.extend(web3)
  return web3
}

var Debugger = require('./debugger')

ReactDOM.render(
  <Debugger web3={loadWeb3()} />,
  document.getElementById('app')
)
