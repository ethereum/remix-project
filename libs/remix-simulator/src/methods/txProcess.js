const RemixLib = require('remix-lib')
const TxExecution = RemixLib.execution.txExecution
const TxRunner = RemixLib.execution.txRunner

function runCall (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    const returnValue = result.result.execResult.returnValue.toString('hex')
    const toReturn = `0x${returnValue || '0'}`
    return callback(null, toReturn)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, {constant: true}, txRunner, callbacks, finalCallback, true)
}

function runTx (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result.transactionHash)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, {constant: false}, txRunner, callbacks, finalCallback, false)
}

function createContract (payload, from, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result.transactionHash)
  }

  TxExecution.createContract(from, data, value, gasLimit, txRunner, callbacks, finalCallback)
}

let txRunnerInstance

function processTx (executionContext, accounts, payload, isCall, callback) {
  const api = {
    logMessage: (msg) => {
    },
    logHtmlMessage: (msg) => {
    },
    config: {
      getUnpersistedProperty: (key) => {
        return true
      },
      get: () => {
        return true
      }
    },
    detectNetwork: (cb) => {
      cb()
    },
    personalMode: () => {
      return false
    }
  }

  executionContext.init(api.config)

  // let txRunner = new TxRunner(accounts, api)
  if (!txRunnerInstance) {
    txRunnerInstance = new TxRunner(accounts, api, executionContext)
  }
  txRunnerInstance.vmaccounts = accounts
  let { from, to, data, value, gas } = payload.params[0]
  gas = gas || 3000000

  let callbacks = {
    confirmationCb: (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      continueTxExecution(null)
    },
    gasEstimationForceSend: (error, continueTxExecution, cancelCb) => {
      if (error) {
        continueTxExecution(error)
      }
      continueTxExecution()
    },
    promptCb: (okCb, cancelCb) => {
      okCb()
    }
  }

  if (isCall) {
    runCall(payload, from, to, data, value, gas, txRunnerInstance, callbacks, callback)
  } else if (to) {
    runTx(payload, from, to, data, value, gas, txRunnerInstance, callbacks, callback)
  } else {
    createContract(payload, from, data, value, gas, txRunnerInstance, callbacks, callback)
  }
}

module.exports = processTx
