'use strict'
import { toNumber, ethers } from 'ethers'

export function loadWeb3 (url = 'http://localhost:8545') {
  const provider = new ethers.JsonRpcProvider(url)
  extendProvider(provider)
  return provider
}

export function web3DebugNode (networkid: string) {
  const web3DebugNodes: { [key: number]: string } = {
    1: 'https://shared.eu-central-1.getblock.io/7e6ea21884124608a04c97748e7f831e',
    11155111: 'https://shared.eu-central-1.getblock.io/7fbe62b139884d2c9c1616ca0de8b5b2',
    42161: 'https://shared.us-east-1.getblock.io/b6991c85cb2a4dbfb3fc11db0b871efb',
    10: 'https://shared.eu-central-1.getblock.io/5ca85a62299b42de81dba72e4deea2bc'
  }
  // Convert string network ID to number for lookup
  const numericNetworkId = parseInt(networkid, 10)
  if (web3DebugNodes[numericNetworkId]) {
    return loadWeb3(web3DebugNodes[numericNetworkId])
  }
  return null
}

export function extendProvider (provider) { // Provider should be ethers.js provider

  if (!provider.debug) provider.debug = {}

  provider.debug.preimage = (key, cb) => {
    provider.send('debug_preimage', [key])
      .then(result => cb(null, result))
      .catch(error => cb(error))
  }

  provider.debug.traceTransaction = (txHash, options, cb) => {
    provider.send('debug_traceTransaction', [txHash, options])
      .then(result => cb(null, result))
      .catch(error => cb(error))
  }

  provider.debug.storageRangeAt = (txBlockHash, txIndex, address, start, maxSize, cb) => {
    provider.send('debug_storageRangeAt', [txBlockHash, toNumber(txIndex), address, start, maxSize])
      .then(result => cb(null, result))
      .catch(error => cb(error))
  }
}
