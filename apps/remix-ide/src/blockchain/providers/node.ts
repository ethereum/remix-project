import Web3 from 'web3'
import { hashPersonalMessage } from '@ethereumjs/util'
import { Personal } from 'web3-eth-personal'
import { ExecutionContext } from '../execution-context'
import Config from '../../config'

export class NodeProvider {
  executionContext: ExecutionContext
  config: Config

  constructor (executionContext: ExecutionContext, config: Config) {
    this.executionContext = executionContext
    this.config = config
  }

  getAccounts (cb) {
    if (this.config.get('settings/personal-mode')) {
      return this.executionContext.web3().eth.personal.getAccounts(cb)
    }
    return this.executionContext.web3().eth.getAccounts(cb)
  }

  newAccount (passwordPromptCb, cb) {
    if (!this.config.get('settings/personal-mode')) {
      return cb('Not running in personal mode')
    }
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
