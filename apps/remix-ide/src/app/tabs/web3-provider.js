import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import {isBigInt} from 'web3-validator'
import { addressToString } from "@remix-ui/helper"

export const profile = {
  name: 'web3Provider',
  displayName: 'Global Web3 Provider',
  description: 'Represent the current web3 provider used by the app at global scope',
  methods: ['sendAsync'],
  version: packageJson.version,
  kind: 'provider'
}

const replacer = (key, value) => {
  if (isBigInt(value)) value = value.toString()
  return value
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
      this.askUserPermission('sendAsync', `Calling ${payload.method} with parameters ${JSON.stringify(payload.params, replacer, '\t')}`).then(
        async (result) => {
          if (result) {
            const provider = this.blockchain.web3().currentProvider
            const resultFn = async (error, message) => {
              if (error) {
                // Handle 'The method "debug_traceTransaction" does not exist / is not available.' error
                if(error.message && error.code && error.code === -32601) {
                  this.call('terminal', 'log', { value: error.message, type: 'error' } )
                  return reject(error.message)
                } else {
                  const errorData = error.data || error.message || error
                  // See: https://github.com/ethers-io/ethers.js/issues/901
                  if (!(typeof errorData === 'string' && errorData.includes("unknown method eth_chainId"))) this.call('terminal', 'log', { value: error.data || error.message, type: 'error' } )
                  return reject(errorData)
                }
              }
              if (message && message.error) {
                const errorMsg = message.error?.message || message.error
                this.call('terminal', 'log', { value: errorMsg, type: 'error' } )
                return reject(errorMsg)
              }
              if (payload.method === 'eth_sendTransaction') {
                if (payload.params.length && !payload.params[0].to && message.result) {
                  setTimeout(async () => {
                    const receipt = await this.tryTillReceiptAvailable(message.result)
                    if (!receipt.contractAddress) {
                      console.log('receipt available but contract address not present', receipt)
                      return
                    }
                    const contractAddressStr = addressToString(receipt.contractAddress)
                    const contractData = await this.call('compilerArtefacts', 'getContractDataFromAddress', contractAddressStr)
                    if (contractData) {
                      const data = await this.call('compilerArtefacts', 'getCompilerAbstract', contractData.file)
                      const contractObject = {
                        name: contractData.name,
                        abi: contractData.contract.abi,
                        compiler: data,
                        contract: {
                          file : contractData.file,
                          object: contractData.contract
                        }
                      }
                      this.call('udapp', 'addInstance', contractAddressStr, contractData.contract.abi, contractData.name, contractObject)
                      await this.call('compilerArtefacts', 'addResolvedContract', contractAddressStr, data)
                    }
                  }, 50)
                  const provider = this.blockchain.executionContext.getProviderObject()

                  // a basic in-browser VM state.
                  const isBasicVMState = provider.config.isVM && !provider.config.isVMStateForked && !provider.config.isRpcForkedState
                  // a standard fork of an in-browser state.
                  const isForkedVMState = provider.config.isVM && provider.config.isVMStateForked && !provider.config.isRpcForkedState
                  // a fork of an in-browser state which derive from a live network.
                  const isForkedRpcState = provider.config.isVM && provider.config.isVMStateForked && provider.config.isRpcForkedState

                  if (isBasicVMState || isForkedVMState || isForkedRpcState) {
                    if (this.blockchain.config.get('settings/save-evm-state')) {
                      try {
                        let state = await this.blockchain.executionContext.getStateDetails()
                        if (provider.config.statePath) {
                          const stateFileExists = await this.call('fileManager', 'exists', provider.config.statePath)
                          if (stateFileExists) {
                            let stateDetails = await this.call('fileManager', 'readFile', provider.config.statePath)
                            stateDetails = JSON.parse(stateDetails)
                            state = JSON.parse(state)
                            state['stateName'] = stateDetails.stateName
                            state['forkName'] = stateDetails.forkName
                            state['savingTimestamp'] = stateDetails.savingTimestamp
                            state = JSON.stringify(state, null, 2)
                          }
                          this.call('fileManager', 'writeFile', provider.config.statePath, state)
                        } else if (isBasicVMState && !isForkedRpcState && !isForkedRpcState) {
                          // in that case, we store the state only if it is a basic VM.
                          const provider = this.blockchain.executionContext.getProvider()
                          this.call('fileManager', 'writeFile', `.states/${provider}/state.json`, state)
                        }
                      } catch (e) {
                        console.error(e)
                      }
                    }
                  }
                }
              }
              resolve(message)
            }
            try {
              resultFn(null, await provider.sendAsync(payload))
            } catch (e) {
              resultFn(e.error ? e.error : e)
            }
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
