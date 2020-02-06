const Web3 = require('web3')
const { stripHexPrefix } = require('ethereumjs-util')

class InjectedProvider {

  constructor (executionContext) {
    this.executionContext = executionContext
  }

  getAccounts (cb) {
    return this.executionContext.web3().eth.getAccounts(cb)
  }

  newAccount (passwordPromptCb, cb) {
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

  getGasPrice (cb) {
    this.executionContext.web3().eth.getGasPrice(cb)
  }

  signMessage (message, account, _passphrase, cb) {
    const hashedMsg = Web3.utils.sha3(message)
    try {
      this.executionContext.web3().eth.sign(hashedMsg, account, (error, signedData) => {
        cb(error, hashedMsg, signedData)
      })
    } catch (e) {
      cb(e.message)
    }
  }

  getProvider () {
    return 'injected'
  }
}

module.exports = InjectedProvider
