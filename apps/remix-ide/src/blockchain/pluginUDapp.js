const { EventEmitter } = require('events')

class PluginUdapp {

  constructor (blockchain) {
    this.blockchain = blockchain
    this.events = new EventEmitter()
    this.setupEvents()
  }

  setupEvents () {
    this.blockchain.events.on('newTransaction', (tx, receipt) => {
      this.events.emit('newTransaction', tx, receipt)
    })
  }

  createVMAccount (newAccount) {
    return this.blockchain.createVMAccount(newAccount)
  }

  sendTransaction (tx) {
    return this.blockchain.sendTransaction(tx)
  }

  getAccounts (cb) {
    return this.blockchain.getAccounts(cb)
  }

  pendingTransactionsCount () {
    return this.blockchain.pendingTransactionsCount()
  }

}

module.exports = PluginUdapp
