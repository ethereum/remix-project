'use strict'

module.exports = {
  web3DebugNode: function (network) {
    if (web3DebugNodes[network]) {
      return this.loadWeb3(web3DebugNodes[network])
    }
    return null
  },

  extend: function (web3) {
    if (!web3.extend) {
      return
    }
    // DEBUG
    const methods = []
    if (!(web3.debug && web3.debug.preimage)) {
      methods.push(new web3.extend.Method({
        name: 'preimage',
        call: 'debug_preimage',
        inputFormatter: [null],
        params: 1
      }))
    }

    if (!(web3.debug && web3.debug.traceTransaction)) {
      methods.push(new web3.extend.Method({
        name: 'traceTransaction',
        call: 'debug_traceTransaction',
        inputFormatter: [null, null],
        params: 2
      }))
    }

    if (!(web3.debug && web3.debug.storageRangeAt)) {
      methods.push(new web3.extend.Method({
        name: 'storageRangeAt',
        call: 'debug_storageRangeAt',
        inputFormatter: [null, null, null, null, null],
        params: 5
      }))
    }
    if (methods.length > 0) {
      web3.extend({
        property: 'debug',
        methods: methods,
        properties: []
      })
    }
  }
}

const web3DebugNodes = {
  'Main': 'https://mainnet.infura.io/remix',
  'Rinkeby': 'https://remix-rinkeby.ethdevops.io',
  'Ropsten': 'https://remix-ropsten.ethdevops.io',
  'Goerli': 'https://remix-goerli.ethdevops.io',
  'Kovan': 'https://remix-kovan.ethdevops.io'
}
