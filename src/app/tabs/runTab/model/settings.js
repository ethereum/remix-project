// var ethJSUtil = require('ethereumjs-util')
// var Personal = require('web3-eth-personal')
var remixLib = require('remix-lib')
// var Web3 = require('web3')
// const addTooltip = require('../../../ui/tooltip')
var EventManager = remixLib.EventManager

class Settings {

  constructor (blockchain, executionContext, udapp) {
    this.blockchain = blockchain
    this.executionContext = executionContext
    this.udapp = udapp
    this.event = new EventManager()

    // this.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    //   this.event.trigger('transactionExecuted', [error, from, to, data, lookupOnly, txResult])
    // })

    // this.blockchain.event.register('contextChanged', (context, silent) => {
    //   this.event.trigger('contextChanged', [context, silent])
    // })

    // this.blockchain.event.register('addProvider', (network) => {
    //   this.event.trigger('addProvider', [network])
    // })

    // this.blockchain.event.register('removeProvider', (name) => {
    //   this.event.trigger('removeProvider', [name])
    // })

    // this.networkcallid = 0
  }

}

module.exports = Settings
