import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'

export const profile = {
  name: 'web3Provider',
  displayName: 'Global Web3 Provider',
  description: 'Represent the current web3 provider used by the app at global scope',
  methods: ['sendAsync'],
  version: packageJson.version,
  kind: 'provider'
}

export class Web3ProviderModule extends Plugin {
  constructor(blockchain) {
    super(profile)
    this.blockchain = blockchain
  }

  /*
    that is used by plugins to call the current ethereum provider.
    Should be taken carefully and probably not be release as it is now.
  */
  sendAsync(payload) {

    return new Promise((resolve, reject) => {
      this.askUserPermission('sendAsync', `Calling ${payload.method} with parameters ${JSON.stringify(payload.params, null, '\t')}`).then(
        async (result) => {
          if (result) {
            const provider = this.blockchain.web3().currentProvider
            // see https://github.com/ethereum/web3.js/pull/1018/files#diff-d25786686c1053b786cc2626dc6e048675050593c0ebaafbf0814e1996f22022R129
            provider[provider.sendAsync ? 'sendAsync' : 'send'](payload, async (error, message) => {
              if (error) return reject(error)
              if (payload.method === 'eth_sendTransaction') {
                if (payload.params.length && !payload.params[0].to && message.result) {
                  setTimeout(async () => {
                    const receipt = await this.tryTillReceiptAvailable(message.result)
                    if (!receipt.contractAddress) {
                      console.log('receipt available but contract address not present', receipt)
                      return
                    }
                    const contractData = await this.call('compilerArtefacts', 'getContractDataFromAddress', receipt.contractAddress)
                    if (contractData) this.call('udapp', 'addInstance', receipt.contractAddress, contractData.contract.abi, contractData.name)
                  }, 50)
                }
              }
              resolve(message)
            })
          } else {
            reject(new Error('User denied permission'))
          }
        }).catch((e) => {
          reject(e)
        })
    })
  }

  async tryTillReceiptAvailable(txhash) {
    try {
      const receipt = await this.call('blockchain', 'getTransactionReceipt', txhash)
      if (receipt) return receipt
    } catch (e) {
      // do nothing
    }
    await this.pause()
    return await this.tryTillReceiptAvailable(txhash)
  }

  async pause() {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 500)
    })
  }
}
