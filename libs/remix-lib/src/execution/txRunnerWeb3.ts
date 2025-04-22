'use strict'
import { EventManager } from '../eventManager'
import type { Transaction as InternalTransaction } from './txRunner'
import { Web3 } from 'web3'
import { ethers } from 'ethers'
import { normalizeHexAddress } from '../helpers/uiHelper'
import { toBigInt, toHex, toChecksumAddress } from 'web3-utils'
import { randomBytes } from 'crypto'
import "viem/window"
import { custom, http, createWalletClient, createPublicClient, encodePacked, getContractAddress } from "viem"
import * as chains from "viem/chains"
import { entryPoint07Address } from "viem/account-abstraction"
const { createSmartAccountClient } = require("permissionless")
const { toSafeSmartAccount } = require("permissionless/accounts")
const { createPimlicoClient } = require("permissionless/clients/pimlico")

export class TxRunnerWeb3 {
  event
  _api
  getWeb3: () => Web3
  currentblockGasLimit: () => number

  constructor (api, getWeb3, currentblockGasLimit) {
    this.event = new EventManager()
    this.getWeb3 = getWeb3
    this.currentblockGasLimit = currentblockGasLimit
    this._api = api
  }

  async _executeTx (tx, network, txFee, api, promptCb, callback) {
    if (network && network.lastBlock && network.lastBlock.baseFeePerGas) {
      // the sending stack (web3.js / metamask need to have the type defined)
      // this is to avoid the following issue: https://github.com/MetaMask/metamask-extension/issues/11824
      tx.type = '0x2'
    } else {
      // tx.type = '0x1'
    }
    if (txFee) {
      if (txFee.baseFeePerGas) {
        tx.maxPriorityFeePerGas = toHex(BigInt(this.getWeb3().utils.toWei(txFee.maxPriorityFee, 'gwei')))
        tx.maxFeePerGas = toHex(BigInt(this.getWeb3().utils.toWei(txFee.maxFee, 'gwei')))
        tx.type = '0x2'
      } else {
        tx.gasPrice = toHex(BigInt(this.getWeb3().utils.toWei(txFee.gasPrice, 'gwei')))
        // tx.type = '0x1'
      }
    }

    let currentDateTime = new Date();

    const cb = (err, resp, isCreation: boolean, isUserOp, contractAddress) => {
      if (err) {
        return callback(err, resp)
      }
      this.event.trigger('transactionBroadcasted', [resp, isUserOp])
      const listenOnResponse = () => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          const receipt = await tryTillReceiptAvailable(resp, this.getWeb3())
          tx = await tryTillTxAvailable(resp, this.getWeb3())
          if (isCreation && !receipt.contractAddress) {
            // if it is a isCreation, contractAddress should be defined.
            // if it's not the case look for the event ContractCreated(uint256,address,uint256,bytes32) and extract the address
            // topic id: 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3
            if (receipt.logs && receipt.logs.length) {
              receipt.logs.map((log) => {
                if (log.topics[0] === '0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3') {
                  (receipt as any).contractAddress = toChecksumAddress(normalizeHexAddress(toHex(log.topics[2])))
                }
              })
            }
          }
          currentDateTime = new Date();
          if (isUserOp && contractAddress && !receipt.contractAddress) (receipt as any).contractAddress = contractAddress
          resolve({
            receipt,
            tx,
            transactionHash: receipt ? receipt['transactionHash'] : null
          })
        })
      }
      listenOnResponse().then((txData) => {
        callback(null, txData)
      }).catch((error) => { callback(error) })
    }

    const isCreation = !tx.to
    if (api.personalMode()) {
      promptCb(
        async (value) => {
          try {
            const res = await (this.getWeb3() as any).eth.personal.sendTransaction({ ...tx, value }, { checkRevertBeforeSending: false, ignoreGasPricing: true })
            cb(null, res.transactionHash, isCreation, false, null)

          } catch (e) {
            console.log(`Send transaction failed: ${e.message || e.error} . if you use an injected provider, please check it is properly unlocked. `)
            // in case the receipt is available, we consider that only the execution failed but the transaction went through.
            // So we don't consider this to be an error.
            if (e.receipt) cb(null, e.receipt.transactionHash, isCreation, false, null)
            else cb(e, null, isCreation, false, null)
          }
        },
        () => {
          return callback('Canceled by user.')
        }
      )
    } else {
      try {
        if (tx.fromSmartAccount) {
          const { txHash, contractAddress } = await this.sendUserOp(tx)
          cb(null, txHash, isCreation, true, contractAddress)
        } else {
          const res = await this.getWeb3().eth.sendTransaction(tx, null, { checkRevertBeforeSending: false, ignoreGasPricing: true })
          cb(null, res.transactionHash, isCreation, false, null)
        }
      } catch (e) {
        if (!e.message) e.message = ''
        if (e.error) {
          e.message = e.message + ' ' + e.error
        }
        console.log(`Send transaction failed: ${e.message} . if you use an injected provider, please check it is properly unlocked. `)
        // in case the receipt is available, we consider that only the execution failed but the transaction went through.
        // So we don't consider this to be an error.
        if (e.receipt) cb(null, e.receipt.transactionHash, isCreation, false, null)
        else cb(e, null, isCreation, false, null)
      }
    }
  }

  execute (args: InternalTransaction, confirmationCb, gasEstimationForceSend, promptCb, callback) {
    let data = args.data
    if (data.slice(0, 2) !== '0x') {
      data = '0x' + data
    }

    return this.runInNode(args.from, args.fromSmartAccount, args.deployedBytecode, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, confirmationCb, gasEstimationForceSend, promptCb, callback)
  }

  runInNode (from, fromSmartAccount, deployedBytecode, to, data, value, gasLimit, useCall, timestamp, confirmCb, gasEstimationForceSend, promptCb, callback) {
    const tx = { from: from, fromSmartAccount, deployedBytecode, to: to, data: data, value: value }
    if (!from) return callback('the value of "from" is not defined. Please make sure an account is selected.')
    if (useCall) {
      if (this._api && this._api.isVM()) {
        (this.getWeb3() as any).remix.registerCallId(timestamp)
      }
      this.getWeb3().eth.call(tx)
        .then((result: any) => callback(null, {
          result: result
        }))
        .catch(error => callback(error))
      return
    }
    this._api.detectNetwork((errNetWork, network) => {
      if (errNetWork) {
        console.log(errNetWork)
        return
      }
      const txCopy = { ...tx, type: undefined, maxFeePerGas: undefined, gasPrice: undefined }
      if (network && network.lastBlock) {
        if (network.lastBlock.baseFeePerGas) {
          // the sending stack (web3.js / metamask need to have the type defined)
          // this is to avoid the following issue: https://github.com/MetaMask/metamask-extension/issues/11824
          txCopy.type = '0x2'
          txCopy.maxFeePerGas = Math.ceil(Number((toBigInt(network.lastBlock.baseFeePerGas) + toBigInt(network.lastBlock.baseFeePerGas) / BigInt(3)).toString()))
        } else {
          txCopy.type = '0x1'
          txCopy.gasPrice = undefined
        }
      }
      const ethersProvider = new ethers.providers.Web3Provider(this.getWeb3().currentProvider as any)
      ethersProvider.estimateGas(txCopy)
        .then(gasEstimationBigInt => {
          gasEstimationForceSend(null, () => {
            const gasEstimation = gasEstimationBigInt.toNumber()
            /*
            * gasLimit is a value that can be set in the UI to hardcap value that can be put in a tx.
            * e.g if the gasestimate
            */
            if (gasLimit !== '0x0' && gasEstimation > gasLimit) {
              return callback(`estimated gas for this transaction (${gasEstimation}) is higher than gasLimit set in the configuration  (${gasLimit}). Please raise the gas limit.`)
            }

            if (gasLimit === '0x0') {
              tx['gas'] = gasEstimation
            } else {
              tx['gas'] = gasLimit
            }

            if (this._api.config.getUnpersistedProperty('doNotShowTransactionConfirmationAgain')) {
              return this._executeTx(tx, network, null, this._api, promptCb, callback)
            }

            confirmCb(network, tx, tx['gas'], (txFee) => {
              return this._executeTx(tx, network, txFee, this._api, promptCb, callback)
            }, (error) => {
              callback(error)
            })
          }, callback)
        })
        .catch(err => {
          if (err && err.error && err.error.indexOf('Invalid JSON RPC response') !== -1) {
            // // @todo(#378) this should be removed when https://github.com/WalletConnect/walletconnect-monorepo/issues/334 is fixed
            callback(new Error('Gas estimation failed because of an unknown internal error. This may indicated that the transaction will fail.'))
            return
          }
          if (tx.fromSmartAccount && tx.value === "0" && err && err.error && err.error.indexOf('insufficient funds for transfer') !== -1) {
            // Do not show dialog for insufficient funds as smart account may be using paymaster
            // @todo If paymaster is used, check if balance/credits are available
            err = null
          }
          err = network.name === 'VM' ? null : err // just send the tx if "VM"
          gasEstimationForceSend(err, () => {
            const defaultGasLimit = 3000000
            tx['gas'] = gasLimit === '0x0' ? '0x' + defaultGasLimit.toString(16) : gasLimit

            if (this._api.config.getUnpersistedProperty('doNotShowTransactionConfirmationAgain')) {
              return this._executeTx(tx, network, null, this._api, promptCb, callback)
            }

            confirmCb(network, tx, tx['gas'], (txFee) => {
              return this._executeTx(tx, network, txFee, this._api, promptCb, callback)
            }, (error) => {
              callback(error)
            })
          }, callback)
        })
    })
  }

  async sendUserOp (tx) {
    const localStorageKey = 'smartAccounts'
    const PUBLIC_NODE_URL = "https://go.getblock.io/ee42d0a88f314707be11dd799b122cb9"
    const determiniticProxyAddress = "0x4e59b44847b379578588920cA78FbF26c0B4956C"
    const network = 'sepolia'
    const chain = chains[network]
    const BUNDLER_URL = `https://pimlico.remixproject.org/api/proxy/${chain.id}`

    // Check that saOwner is there in MM addresses
    let smartAccountsObj = localStorage.getItem(localStorageKey)
    smartAccountsObj = JSON.parse(smartAccountsObj)
    const saDetails = smartAccountsObj[chain.id][tx.from]
    const saOwner = saDetails['ownerEOA']

    // both are needed. public client to get nonce and read blockchain. wallet client to sign the useroperation
    const walletClient = createWalletClient({
      account: saOwner,
      chain,
      transport: custom(window.ethereum!),
    })

    const publicClient = createPublicClient({
      chain,
      transport: http(PUBLIC_NODE_URL) // choose any provider here
    })

    const safeAccount = await toSafeSmartAccount({
      client: publicClient,
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      owners: [walletClient],
      version: "1.4.1",
      address: tx.from // tx.from & saDetails['address'] should be same
    })

    const paymasterClient = createPimlicoClient({
      transport: http(BUNDLER_URL),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    })
    const saClient = createSmartAccountClient({
      account: safeAccount,
      chain,
      paymaster: paymasterClient,
      bundlerTransport: http(BUNDLER_URL),
      userOperation: {
        estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
      }
    })

    const salt: `0x${string}` = `0x${randomBytes(32).toString('hex')}`
    const bytecode = tx.data

    const expectedDeploymentAddress = getContractAddress({
      bytecode,
      from: determiniticProxyAddress,
      opcode: 'CREATE2',
      salt
    })
    let txHash, contractAddress
    if (!tx.to) {
      // contract deployment transaction
      txHash = await saClient.sendTransaction({
        to:  determiniticProxyAddress,
        data: encodePacked(["bytes32", "bytes"], [salt, bytecode])
      })
      // check if code is deployed to expectedDeployment Address
      const expectedBytecode = await publicClient.getCode({
        address: expectedDeploymentAddress,
      })
      if (expectedBytecode === tx.deployedBytecode) {
        contractAddress = expectedDeploymentAddress
      } else {
        contractAddress = undefined
        console.error('Error in contract deployment')
      }
    } else {
      // contract interaction transaction
      txHash = await saClient.sendTransaction({
        to:  tx.to,
        data: tx.data,
        value: tx.value
      })
    }

    return { txHash, contractAddress }
  }
}

async function tryTillReceiptAvailable (txhash: string, web3: Web3) {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txhash)
    if (receipt) {
      if (!receipt.to && !receipt.contractAddress) {
        // this is a contract creation and the receipt doesn't contain a contract address. we have to keep polling...
        console.log('this is a contract creation and the receipt does not contain a contract address. we have to keep polling...')
      } else
        return receipt
    }
  } catch (e) {}
  await pause()
  return await tryTillReceiptAvailable(txhash, web3)
}

async function tryTillTxAvailable (txhash: string, web3: Web3) {
  try {
    const tx = await web3.eth.getTransaction(txhash)
    if (tx && tx.blockHash) return tx
  } catch (e) {}
  return await tryTillTxAvailable(txhash, web3)
}

async function pause () { return new Promise((resolve, reject) => { setTimeout(resolve, 500) }) }
