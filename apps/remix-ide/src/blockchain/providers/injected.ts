import { Web3 } from 'web3'
import { hashPersonalMessage, isHexString, bytesToHex } from '@ethereumjs/util'
import { Personal } from 'web3-eth-personal'
import { ExecutionContext } from '../execution-context'

export class InjectedProvider {
  executionContext: ExecutionContext

  constructor (executionContext) {
    this.executionContext = executionContext
  }

  getAccounts (cb) {
    return this.executionContext.web3().eth.getAccounts()
      .then(accounts => cb(null, accounts))
      .catch(err => {
        cb(err.message)
      })
  }

  newAccount (passwordPromptCb, cb) {
    passwordPromptCb((passphrase) => {
      this.executionContext.web3().eth.personal.newAccount(passphrase).then((result) => cb(null, result)).catch(error => cb(error))
    })
  }

  async resetEnvironment () {
    /* Do nothing. */
  }

  async getBalanceInEther (address) {
    const balance = await this.executionContext.web3().eth.getBalance(address)
    const balInString = balance.toString(10)
    return balInString === '0' ? balInString : Web3.utils.fromWei(balInString, 'ether')
  }

  getGasPrice (cb) {
    this.executionContext.web3().eth.getGasPrice().then((result => cb(null, result)))
  }

  signMessage (message, account, _passphrase, cb) {
    message = isHexString(message) ? message : Web3.utils.utf8ToHex(message)
    const messageHash = hashPersonalMessage(Buffer.from(message))
    try {
      const personal = new Personal(this.executionContext.web3().currentProvider)
      personal.sign(messageHash, account).then((signedData) => {
        cb(null, bytesToHex(messageHash), signedData)
      }).catch((error => cb(error)))
    } catch (e) {
      cb(e.message)
    }
  }
}
