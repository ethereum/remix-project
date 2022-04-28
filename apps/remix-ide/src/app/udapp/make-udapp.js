import Registry from '../state/registry'

var remixLib = require('@remix-project/remix-lib')
var EventsDecoder = remixLib.execution.EventsDecoder

export function makeUdapp (blockchain, compilersArtefacts, logHtmlCallback) {
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
