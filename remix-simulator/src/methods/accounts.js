var Web3 = require('web3')

var Accounts = function () {
  this.web3 = new Web3()
  // TODO: make it random and/or use remix-libs
  this.accounts = [this.web3.eth.accounts.create(['abcd'])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0]
  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex')
}

Accounts.prototype.methods = function () {
  return {
    eth_accounts: this.eth_accounts.bind(this)
  }
}

Accounts.prototype.eth_accounts = function (payload, cb) {
  return cb(null, this.accounts.map((x) => x.address))
}

module.exports = Accounts
