import { execution } from '@remix-project/remix-lib'
const TxExecution = execution.txExecution
const TxRunnerVM = execution.TxRunnerVM
const TxRunner = execution.TxRunner


function runCall (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }    
    return callback(null, result)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, { constant: true }, txRunner, callbacks, finalCallback)
}

function runTx (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, { constant: false }, txRunner, callbacks, finalCallback)
}

function createContract (payload, from, data, value, gasLimit, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result)
  }

  TxExecution.createContract(from, data, value, gasLimit, txRunner, callbacks, finalCallback)
}

let txRunnerVMInstance
let txRunnerInstance

export function processTx (vmContext, accounts, payload, isCall, callback) {
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

  if (!txRunnerVMInstance) {
    txRunnerVMInstance = new TxRunnerVM(accounts, api, _ => vmContext.vm())
  }
  if (!txRunnerInstance) {
    txRunnerInstance = new TxRunner(txRunnerVMInstance, { runAsync: false })
  }
  txRunnerInstance.vmaccounts = accounts
  let { from, to, data, value, gas } = payload.params[0]
  gas = gas || 3000000

  const callbacks = {
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
