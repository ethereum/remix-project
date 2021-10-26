const Web3 = require('web3')
const { BN, privateToAddress, hashPersonalMessage } = require('ethereumjs-util')
const { Provider, extend } = require('@remix-project/remix-simulator')

class VMProvider {
  constructor (executionContext) {
    this.executionContext = executionContext
  }

  getAccounts (cb) {
    this.web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return cb('No accounts?')
      }
      return cb(null, accounts)
    })
  }

  resetEnvironment () {
    this.accounts = {}
    this.RemixSimulatorProvider = new Provider({ fork: this.executionContext.getCurrentFork() })
    this.RemixSimulatorProvider.init()
    this.web3 = new Web3(this.RemixSimulatorProvider)
    extend(this.web3)
    this.accounts = {}
    this.executionContext.setWeb3('vm', this.web3)
  }

  // TODO: is still here because of the plugin API
  // can be removed later when we update the API
  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    this.RemixSimulatorProvider.Accounts._addAccount(privateKey, balance)
    const privKey = Buffer.from(privateKey, 'hex')
    return '0x' + privateToAddress(privKey).toString('hex')
  }

  newAccount (_passwordPromptCb, cb) {
    this.RemixSimulatorProvider.Accounts.newAccount(cb)
  }

  getBalanceInEther (address, cb) {
    this.web3.eth.getBalance(address, (err, res) => {
      if (err) {
        return cb(err)
      }
      cb(null, Web3.utils.fromWei(new BN(res).toString(10), 'ether'))
    })
  }

  getGasPrice (cb) {
    this.web3.eth.getGasPrice(cb)
  }

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    this.web3.eth.sign(message, account, (error, signedData) => {
      if (error) {
        return cb(error)
      }
      cb(null, '0x' + messageHash.toString('hex'), signedData)
    })
  }

  getProvider () {
    return 'vm'
  }
}

module.exports = VMProvider
