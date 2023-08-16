import Web3 from 'web3'
import { hashPersonalMessage } from '@ethereumjs/util'
import { ExecutionContext } from '../execution-context'

export class InjectedProvider {
  executionContext: ExecutionContext

  constructor (executionContext) {
    this.executionContext = executionContext
  }

  getAccounts (cb) {
    return this.executionContext.web3().eth.getAccounts().then(res => cb(null, res)).catch(err => cb(err))
  }

  newAccount (passwordPromptCb, cb) {
    passwordPromptCb((passphrase) => {
      this.executionContext.web3().eth.personal.newAccount(passphrase).then(res => cb(null, res)).catch(err => cb(err))
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
    this.executionContext.web3().eth.getGasPrice().then(res => cb(null, res)).catch(err => cb(err))
  }

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    try {
      this.executionContext.web3().eth.personal.sign(message, account)
        .then(signedData=>cb(null, '0x' + messageHash.toString('hex'), signedData))
        .catch(error=>cb(error, '0x' + messageHash.toString('hex')))
    } catch (e) {
      cb(e.message)
    }
  }

  getProvider () {
    return 'injected'
  }
}
