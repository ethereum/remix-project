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

  getSelectedAccount () {
    return new Promise((resolve, reject) => {
      const runTab = document.querySelector('#runTabView')
      resolve(runTab && runTab.querySelector('#txorigin').selectedOptions[0].value)
    })
  }

  pendingTransactionsCount () {
    return this.blockchain.pendingTransactionsCount()
  }
}

module.exports = PluginUdapp
