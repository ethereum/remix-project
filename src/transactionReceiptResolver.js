'use strict'
var executionContext = require('./execution-context')

module.exports = class TransactionReceiptResolver {
  constructor () {
    this._transactionReceipts = {}
  }

  resolve (tx, cb) {
    if (this._transactionReceipts[tx.hash]) {
      return cb(null, this._transactionReceipts[tx.hash])
    }
    executionContext.web3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
      if (!error) {
        this._transactionReceipts[tx.hash] = receipt
        cb(null, receipt)
      } else {
        cb(error)
      }
    })
  }
}

