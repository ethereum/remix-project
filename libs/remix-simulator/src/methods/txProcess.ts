import { execution, Transaction } from '@remix-project/remix-lib'
const TxExecution = execution.txExecution

function runCall ({ from, to, data, value, gasLimit, signed }: Transaction, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    return callback(null, result)
  }

  TxExecution.callFunction({ from, to, data, value, gasLimit, signed }, { constant: true }, txRunner, callbacks, finalCallback)
}

function runTx ({ from, to, data, value, gasLimit, signed }: Transaction, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result)
  }

  TxExecution.callFunction({ from, to, data, value, gasLimit, signed }, { constant: false }, txRunner, callbacks, finalCallback)
}

function createContract ({ from, data, value, gasLimit, signed }: Transaction, txRunner, callbacks, callback) {
  const finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result)
  }

  TxExecution.createContract({ from, data, value, gasLimit, signed }, txRunner, callbacks, finalCallback)
}

export function processTx (txRunnerInstance, payload, isCall, callback) {
  let { from, to, data, input, value, gas, signed } = payload.params[0] // eslint-disable-line
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
    runCall({ from, to, data: data||input, value, gasLimit: gas, signed }, txRunnerInstance, callbacks, callback)
  } else if (to) {
    runTx({ from, to, data: data||input, value, gasLimit: gas, signed }, txRunnerInstance, callbacks, callback)
  } else {
    createContract({ from, to: undefined, data: data||input, value, gasLimit: gas, signed }, txRunnerInstance, callbacks, callback)
  }
}
