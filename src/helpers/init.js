'use strict'
var Web3 = require('web3')
var Web3Admin = require('../util/web3Admin')

module.exports = {
  loadWeb3: function () {
    var web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
    Web3Admin.extend(web3)
    return web3
  },

  extendWeb3: function (web3) {
    Web3Admin.extend(web3)
  },

  setProvider: function (web3, url) {
    web3.setProvider(new web3.providers.HttpProvider(url))
  }
}
