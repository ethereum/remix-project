var Web3 = require('web3')

var Accounts = function () {
  this.web3 = new Web3()
  // TODO: make it random and/or use remix-libs
  this.accounts = [this.web3.eth.accounts.create(['abcd']), this.web3.eth.accounts.create(['ef12']), this.web3.eth.accounts.create(['ef34'])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0]
  this.accounts[this.accounts[1].address.toLowerCase()] = this.accounts[1]
  this.accounts[this.accounts[2].address.toLowerCase()] = this.accounts[2]

  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex')
  this.accounts[this.accounts[1].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[1].address.toLowerCase()].privateKey.slice(2), 'hex')
  this.accounts[this.accounts[2].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[2].address.toLowerCase()].privateKey.slice(2), 'hex')
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
