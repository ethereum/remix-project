const ethJSUtil = require('ethereumjs-util')
const { BN, privateToAddress, isValidPrivate } = require('ethereumjs-util')
const Web3 = require('web3')
const crypto = require('crypto')

const Accounts = function (executionContext) {
  this.web3 = new Web3()
  this.executionContext = executionContext
  // TODO: make it random and/or use remix-libs
  this.accountsList = [
    this.web3.eth.accounts.create(['abcd']),
    this.web3.eth.accounts.create(['ef12']),
    this.web3.eth.accounts.create(['ef34']),
    this.web3.eth.accounts.create(['ab12']),
    this.web3.eth.accounts.create(['ab34']),
    this.web3.eth.accounts.create(['cd12']),
    this.web3.eth.accounts.create(['cd34']),
    this.web3.eth.accounts.create(['bcde']),
    this.web3.eth.accounts.create(['cdef']),
    this.web3.eth.accounts.create(['1234'])
  ]
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
        const balance = '0x56BC75E2D63100000'
        account.balance = balance || '0xf00000000000000001'
        resolve()
      })
    })
  }

  for (let _account of this.accountsList) {
    await setBalance(_account)
  }
}

Accounts.prototype.resetAccounts = function () {
  // TODO: setting this to {} breaks the app currently, unclear why still
  // this.accounts = {}
  // this.accountsKeys = {}
  this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
  this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
  this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
  this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
  this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
}

Accounts.prototype._addAccount = function (privateKey, balance) {
  privateKey = Buffer.from(privateKey, 'hex')
  const address = ethJSUtil.privateToAddress(privateKey)

  // FIXME: we don't care about the callback, but we should still make this proper
  let stateManager = this.executionContext.vm().stateManager
  stateManager.getAccount(address, (error, account) => {
    if (error) return console.log(error)
    account.balance = balance || '0xf00000000000000001'
    stateManager.putAccount(address, account, (error) => {
      if (error) console.log(error)
    })
  })

  this.accounts[ethJSUtil.toChecksumAddress('0x' + address.toString('hex'))] = { privateKey, nonce: 0 }
  this.accountsKeys[ethJSUtil.toChecksumAddress('0x' + address.toString('hex'))] = '0x' + privateKey.toString('hex')
}

Accounts.prototype.newAccount = function (cb) {
  let privateKey
  do {
    privateKey = crypto.randomBytes(32)
  } while (!isValidPrivate(privateKey))
  this._addAccount(privateKey, '0x56BC75E2D63100000')
  return cb(null, '0x' + privateToAddress(privateKey).toString('hex'))
}

Accounts.prototype.methods = function () {
  return {
    eth_accounts: this.eth_accounts.bind(this),
    eth_getBalance: this.eth_getBalance.bind(this),
    eth_sign: this.eth_sign.bind(this)
  }
}

Accounts.prototype.eth_accounts = function (_payload, cb) {
  return cb(null, Object.keys(this.accounts))
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
