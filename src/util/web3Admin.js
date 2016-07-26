'use strict'
module.exports = {
  extend: function (web3) {
    // DEBUG
    var methods = []
    if (!(web3.debug && web3.debug.traceTransaction)) {
      methods.push(new web3._extend.Method({
        name: 'traceTransaction',
        call: 'debug_traceTransaction',
        inputFormatter: [null, null],
        params: 2
      }))
    }

    if (!(web3.debug && web3.debug.storageAt)) {
      methods.push(new web3._extend.Method({
        name: 'storageAt',
        call: 'debug_storageAt',
        inputFormatter: [null, null, null],
        params: 3
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
