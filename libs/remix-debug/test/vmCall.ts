'use strict'
import { Block } from '@ethereumjs/block'
import { Transaction } from '@ethereumjs/tx'
import VM from '@ethereumjs/vm'
import { rlp, keccak, bufferToHex } from 'ethereumjs-util'
import { extendWeb3 } from '../src/init' 
var utileth = require('ethereumjs-util')
var Tx = require('@ethereumjs/tx').Transaction
var BN = require('ethereumjs-util').BN
var remixLib = require('@remix-project/remix-lib')
const { Provider, extend } = require('@remix-project/remix-simulator')
const Web3 = require('web3')


async function getWeb3 () {
  const remixSimulatorProvider = new Provider({ fork: 'berlin' })
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
      from: utileth.Address.fromPrivateKey(from.privateKey).toString('hex'),
      to,
      value,
      data,
      gas: 7000000
    })
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
