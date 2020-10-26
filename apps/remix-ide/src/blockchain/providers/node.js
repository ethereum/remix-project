const Web3 = require('web3')
const { stripHexPrefix, hashPersonalMessage } = require('ethereumjs-util')
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

  sendMethod (address, abi, methodName, params, outputCb) {
    return new Promise((resolve, reject) => {
      // TODO: should use selected account
      this.getAccounts((error, accounts) => {
        const contract = new this.executionContext.web3().eth.Contract(abi, address, { from: accounts[0] })
        contract.methods[methodName].apply(contract.methods[methodName], params).send().then(resolve).catch(reject)
      })
    })
  }

  callMethod (address, abi, methodName, params, outputCb) {
    return new Promise((resolve, reject) => {
      // TODO: should use selected account
      this.getAccounts((error, accounts) => {
        const contract = new this.executionContext.web3().eth.Contract(abi, address, { from: accounts[0] })
        contract.methods[methodName].apply(contract.methods[methodName], params).call().then(resolve).catch(reject)
      })
    })
  }

  async getTransaction(transactionHash) {
    return this.executionContext.web3().eth.getTransaction(transactionHash)
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

  signMessage (message, account, passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    try {
      const personal = new Personal(this.executionContext.web3().currentProvider)
      personal.sign(message, account, passphrase, (error, signedData) => {
        cb(error, '0x' + messageHash.toString('hex'), signedData)
      })
    } catch (e) {
      cb(e.message)
    }
  }

  getProvider () {
    return this.executionContext.getProvider()
  }
}

module.exports = NodeProvider
