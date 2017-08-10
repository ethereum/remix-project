'use strict'

/**
  * This just export a function that register to `newTransaction` and forward them to the logger.
  *
  */
module.exports = (opts = {}) => {
  opts.events.txListener.register('newTransaction', (tx) => {
    log(tx, opts.api)
  })
}

function log (tx, api) {
  var resolvedTransaction = api.resolvedTransaction(tx.hash)
  if (resolvedTransaction) {
    api.parseLogs(tx, resolvedTransaction.contractName, api.compiledContracts(), (error, logs) => {
      if (!error) {
        api.log(renderResolvedTransaction(tx, resolvedTransaction, logs))
      }
    })
  } else {
    // contract unknown - just displaying raw tx.
    api.log(renderTransaction(tx))
  }
}

function renderResolvedTransaction (tx, resolvedTransaction, logs) {
  console.log([tx, resolvedTransaction])
  return JSON.stringify([tx, resolvedTransaction])
}

function renderTransaction (tx) {
  console.log(tx)
  return JSON.stringify(tx)
}
