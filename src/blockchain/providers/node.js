const Web3 = require('web3')
const { stripHexPrefix } = require('ethereumjs-util')
const Personal = require('web3-eth-personal')

class NodeProvider {

  constructor (executionContext, config) {
    this.executionContext = executionContext
    this.config = config
  }

  getAccounts (cb) {
    if (this.config.get('settings/personal-mode')) {
      return this.executionContext.web3().personal.getListAccounts(cb)
    }
    return this.executionContext.web3().eth.getAccounts(cb)
  }

  newAccount (passwordPromptCb, cb) {
    if (!this.config.get('settings/personal-mode')) {
      return cb('Not running in personal mode')
    }
    passwordPromptCb((passphrase) => {
      this.executionContext.web3().personal.newAccount(passphrase, cb)
    })
  }

  resetEnvironment () {
  }

  getBalanceInEther (address, cb) {
    address = stripHexPrefix(address)
    this.executionContext.web3().eth.getBalance(address, (err, res) => {
      if (err) {
        return cb(err)
      }
      cb(null, Web3.utils.fromWei(res.toString(10), 'ether'))
    })
  }

  signMessage (message, account, passphrase, cb) {
    const hashedMsg = Web3.utils.sha3(message)
    try {
      const personal = new Personal(this.executionContext.web3().currentProvider)
      personal.sign(hashedMsg, account, passphrase, (error, signedData) => {
        cb(error.message, hashedMsg, signedData)
      })
    } catch (e) {
      cb(e.message)
    }
  }
}

module.exports = NodeProvider
