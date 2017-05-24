'use strict'
module.exports = {
  extend: function (web3) {
    if (!web3._extend) {
      return
    }
    // DEBUG
    var methods = []
    if (!(web3.debug && web3.debug.preimage)) {
      methods.push(new web3._extend.Method({
        name: 'preimage',
        call: 'debug_preimage',
        inputFormatter: [null],
        params: 1
      }))
    }

    if (!(web3.debug && web3.debug.traceTransaction)) {
      methods.push(new web3._extend.Method({
        name: 'traceTransaction',
        call: 'debug_traceTransaction',
        inputFormatter: [null, null],
        params: 2
      }))
    }

    if (!(web3.debug && web3.debug.storageRangeAt)) {
      methods.push(new web3._extend.Method({
        name: 'storageRangeAt',
        call: 'debug_storageRangeAt',
        inputFormatter: [null, null, null, null, null],
        params: 5
      }))
    }
    if (methods.length > 0) {
      web3._extend({
        property: 'debug',
        methods: methods,
        properties: []
      })
    }
  }
}
