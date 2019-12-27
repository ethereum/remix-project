var registry = require('../../global/registry')
var remixLib = require('remix-lib')
var yo = require('yo-yo')
var EventsDecoder = remixLib.execution.EventsDecoder
var TransactionReceiptResolver = require('../../lib/transactionReceiptResolver')

const transactionDetailsLinks = {
  'Main': 'https://www.etherscan.io/tx/',
  'Rinkeby': 'https://rinkeby.etherscan.io/tx/',
  'Ropsten': 'https://ropsten.etherscan.io/tx/',
  'Kovan': 'https://kovan.etherscan.io/tx/',
  'Goerli': 'https://goerli.etherscan.io/tx/'
}

function txDetailsLink (network, hash) {
  if (transactionDetailsLinks[network]) {
    return transactionDetailsLinks[network] + hash
  }
}

export function makeUdapp (blockchain, udapp, executionContext, compilersArtefacts, logHtmlCallback) {
  // ----------------- UniversalDApp -----------------
  // TODO: to remove when possible
  udapp.event.register('transactionBroadcasted', (txhash, networkName) => {
    var txLink = txDetailsLink(networkName, txhash)
    if (txLink && logHtmlCallback) logHtmlCallback(yo`<a href="${txLink}" target="_blank">${txLink}</a>`)
  })

  // ----------------- Tx listener -----------------
  const transactionReceiptResolver = new TransactionReceiptResolver(blockchain)

  const txlistener = blockchain.getTxListener({
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
    }
  })

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
