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

export function makeUdapp (blockchain, compilersArtefacts, logHtmlCallback) {
  // ----------------- UniversalDApp -----------------
  // TODO: to remove when possible
  blockchain.event.register('transactionBroadcasted', (txhash, networkName) => {
    var txLink = txDetailsLink(networkName, txhash)
    if (txLink && logHtmlCallback) logHtmlCallback(yo`<a href="${txLink}" target="_blank">${txLink}</a>`)
  })

  // ----------------- Tx listener -----------------
  const transactionReceiptResolver = new TransactionReceiptResolver(blockchain)

  const txlistener = blockchain.getTxListener({
    api: {
      contracts: function () {
        if (compilersArtefacts['__last']) return compilersArtefacts.getAllContractDatas()
        return null
      },
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })

  registry.put({api: txlistener, name: 'txlistener'})
  blockchain.startListening(txlistener)

  const eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })
  txlistener.startListening()
  registry.put({api: eventsDecoder, name: 'eventsDecoder'})
}
