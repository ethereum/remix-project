const Web3 = require('web3')
const { stripHexPrefix, hashPersonalMessage } = require('ethereumjs-util')

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

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    try {
      this.executionContext.web3().eth.sign(message, account, (error, signedData) => {
        cb(error, '0x' + messageHash.toString('hex'), signedData)
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
