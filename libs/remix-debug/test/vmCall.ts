'use strict'
import { extendWeb3 } from '../src/init'
import { Address } from '@ethereumjs/util'
import { Web3 } from 'web3';
const { Provider } = require('@remix-project/remix-simulator')

async function getWeb3 () {
  const remixSimulatorProvider = new Provider({ fork: 'cancun' })
  await remixSimulatorProvider.init()
  await remixSimulatorProvider.Accounts.resetAccounts()
  const web3 = new Web3(remixSimulatorProvider)
  extendWeb3(web3)
  return web3
}

async function sendTx (web3, from, to, value, data, cb) {
  try {
    cb = cb || (() => {})
    const receipt = await web3.eth.sendTransaction({
      from: Address.fromPrivateKey(from.privateKey).toString(),
      to,
      value,
      data,
      gas: 7000000
    }, null, { checkRevertBeforeSending: false, ignoreGasPricing: true })
    cb(null, receipt.transactionHash)
    return receipt.transactionHash
  } catch (e) {
    cb(e)
  }
}

module.exports = {
  sendTx,
  getWeb3
}
