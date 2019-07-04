var UniversalDApp = require('./universal-dapp.js')
var registry = require('./global/registry')
var remixLib = require('remix-lib')
var yo = require('yo-yo')
var executionContext = remixLib.execution.executionContext
var Txlistener = remixLib.execution.txListener
var EventsDecoder = remixLib.execution.EventsDecoder
var TransactionReceiptResolver = require('./lib/transactionReceiptResolver')

module.exports = (compilersArtefacts, logHtmlCallback) => {
  // ----------------- UniversalDApp -----------------
  const udapp = new UniversalDApp(registry)
  // TODO: to remove when possible
  udapp.event.register('transactionBroadcasted', (txhash, networkName) => {
    var txLink = executionContext.txDetailsLink(networkName, txhash)
    if (txLink && logHtmlCallback) logHtmlCallback(yo`<a href="${txLink}" target="_blank">${txLink}</a>`)
  })

  // ----------------- Tx listener -----------------
  const transactionReceiptResolver = new TransactionReceiptResolver()

  const txlistener = new Txlistener({
    api: {
      contracts: function () {
        if (compilersArtefacts['__last']) return compilersArtefacts['__last'].getContracts()
        return null
      },
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    },
    event: {
      udapp: udapp.event
    }})
  registry.put({api: txlistener, name: 'txlistener'})
  udapp.startListening(txlistener)

  const eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })
  txlistener.startListening()

  return {udapp, txlistener, eventsDecoder}
}
