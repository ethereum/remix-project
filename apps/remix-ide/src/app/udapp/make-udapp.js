import Registry from '../state/registry'

var remixLib = require('@remix-project/remix-lib')
var yo = require('yo-yo')
var EventsDecoder = remixLib.execution.EventsDecoder

const transactionDetailsLinks = {
  Main: 'https://www.etherscan.io/tx/',
  Rinkeby: 'https://rinkeby.etherscan.io/tx/',
  Ropsten: 'https://ropsten.etherscan.io/tx/',
  Kovan: 'https://kovan.etherscan.io/tx/',
  Goerli: 'https://goerli.etherscan.io/tx/'
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
  const _transactionReceipts = {}
  const transactionReceiptResolver = (tx, cb) => {
    if (_transactionReceipts[tx.hash]) {
      return cb(null, _transactionReceipts[tx.hash])
    }
    blockchain.web3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
      if (error) {
        return cb(error)
      }
      _transactionReceipts[tx.hash] = receipt
      cb(null, receipt)
    })
  }

  const txlistener = blockchain.getTxListener({
    api: {
      contracts: function () {
        if (compilersArtefacts.__last) return compilersArtefacts.getAllContractDatas()
        return null
      },
      resolveReceipt: transactionReceiptResolver
    }
  })

  Registry.getInstance().put({ api: txlistener, name: 'txlistener' })
  blockchain.startListening(txlistener)

  const eventsDecoder = new EventsDecoder({
    resolveReceipt: transactionReceiptResolver
  })
  txlistener.startListening()
  Registry.getInstance().put({ api: eventsDecoder, name: 'eventsDecoder' })
}
