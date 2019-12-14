var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var Web3 = require('web3')

var Accounts = function (executionContext) {
  this.web3 = new Web3()
  this.executionContext = executionContext
  // TODO: make it random and/or use remix-libs
  this.accountsList = [this.web3.eth.accounts.create(['abcd']), this.web3.eth.accounts.create(['ef12']), this.web3.eth.accounts.create(['ef34'])]
  this.accounts = {}
  this.accountsKeys = {}

  this.executionContext.init({get: () => { return true }})
}

Accounts.prototype.init = async function () {
  let setBalance = (account) => {
    return new Promise((resolve, reject) => {
      this.accountsKeys[ethJSUtil.toChecksumAddress(account.address)] = account.privateKey
      this.accounts[ethJSUtil.toChecksumAddress(account.address)] = { privateKey: Buffer.from(account.privateKey.replace('0x', ''), 'hex'), nonce: 0 }

      this.executionContext.vm().stateManager.getAccount(Buffer.from(account.address.replace('0x', ''), 'hex'), (err, account) => {
        if (err) {
          throw new Error(err)
        }
        var balance = '0x56BC75E2D63100000'
        account.balance = balance || '0xf00000000000000001'
        resolve()
      })
    })
  }

  for (let _account of this.accountsList) {
    await setBalance(_account)
  }
}

Accounts.prototype.methods = function () {
  return {
    eth_accounts: this.eth_accounts.bind(this),
    eth_getBalance: this.eth_getBalance.bind(this),
    eth_sign: this.eth_sign.bind(this)
  }
}

Accounts.prototype.eth_accounts = function (payload, cb) {
  return cb(null, this.accountsList.map((x) => ethJSUtil.toChecksumAddress(x.address)))
}

Accounts.prototype.eth_getBalance = function (payload, cb) {
  let address = payload.params[0]
  address = ethJSUtil.stripHexPrefix(address)

  this.executionContext.vm().stateManager.getAccount(Buffer.from(address, 'hex'), (err, account) => {
    if (err) {
      return cb(err)
    }
    cb(null, new BN(account.balance).toString(10))
  })
}

Accounts.prototype.eth_sign = function (payload, cb) {
  const address = payload.params[0]
  const message = payload.params[1]

  const privateKey = this.accountsKeys[ethJSUtil.toChecksumAddress(address)]
  if (!privateKey) {
    return cb(new Error('unknown account'))
  }
  const account = this.web3.eth.accounts.privateKeyToAccount(privateKey)

  const data = account.sign(message)

  cb(null, data.signature)
}

module.exports = Accounts
