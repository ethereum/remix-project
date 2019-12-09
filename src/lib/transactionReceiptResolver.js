'use strict'

module.exports = class TransactionReceiptResolver {
  constructor (executionContext) {
    this._transactionReceipts = {}
    this.executionContext = executionContext
  }

  resolve (tx, cb) {
    if (this._transactionReceipts[tx.hash]) {
      return cb(null, this._transactionReceipts[tx.hash])
    }
    this.executionContext.web3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
      if (!error) {
        this._transactionReceipts[tx.hash] = receipt
        cb(null, receipt)
      } else {
        cb(error)
      }
    })
  }
}

