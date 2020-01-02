const { EventEmitter } = require('events')

class PluginUdapp {

  constructor (blockchain) {
    this.blockchain = blockchain
    this.events = new EventEmitter()
    this.setupEvents()
  }

  setupEvents () {
    this.blockchain.event.register('newTransaction', (tx, receipt) => {
      this.events.trigger('newTransaction', [tx, receipt])
    })
  }

  createVMAccount (newAccount) {
    return this.blockchain.udapp.createVMAccount(newAccount)
  }

  sendTransaction (tx) {
    return this.blockchain.udapp.sendTransaction(tx)
  }

  getAccounts (cb) {
    return this.blockchain.udapp.getAccounts(cb)
  }

  pendingTransactionsCount () {
    return this.blockchain.udapp.pendingTransactionsCount()
  }

}

module.exports = PluginUdapp
