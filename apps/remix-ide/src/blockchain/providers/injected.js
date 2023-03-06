const Web3 = require('web3')
import { hashPersonalMessage } from '@ethereumjs/util'

class InjectedProvider {
  constructor (executionContext) {
    this.executionContext = executionContext
  }

  getAccounts (cb) {
    return this.executionContext.web3().eth.getAccounts(cb)
  }

  newAccount (passwordPromptCb, cb) {
    passwordPromptCb((passphrase) => {
      this.executionContext.web3().eth.personal.newAccount(passphrase, cb)
    })
  }

  async resetEnvironment () {
     /* Do nothing. */ 
  }

  async getBalanceInEther (address) {
    const balance = await this.executionContext.web3().eth.getBalance(address)
    return Web3.utils.fromWei(balance.toString(10), 'ether')
  }

  getGasPrice (cb) {
    this.executionContext.web3().eth.getGasPrice(cb)
  }

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    try {
      this.executionContext.web3().eth.personal.sign(message, account, (error, signedData) => {
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
