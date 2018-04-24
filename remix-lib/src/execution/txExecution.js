'use strict'
var ethers = require('ethers')

module.exports = {
  /**
    * deploy the given contract
    *
    * @param {String} from    - sender address
    * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
    * @param {String} value    - decimal representation of value.
    * @param {String} gasLimit    - decimal representation of gas limit.
    * @param {Object} txRunner    - TxRunner.js instance
    * @param {Object} callbacks    - { confirmationCb, gasEstimationForceSend, promptCb }
    *     [validate transaction] confirmationCb (network, tx, gasEstimation, continueTxExecution, cancelCb)
    *     [transaction failed, force send] gasEstimationForceSend (error, continueTxExecution, cancelCb)
    *     [personal mode enabled, need password to continue] promptCb (okCb, cancelCb)
    * @param {Function} finalCallback    - last callback.
    */
  createContract: function (from, data, value, gasLimit, txRunner, callbacks, finalCallback) {
    if (!callbacks.confirmationCb || !callbacks.gasEstimationForceSend || !callbacks.promptCb) {
      return finalCallback('all the callbacks must have been defined')
    }
    var tx = { from: from, to: null, data: data, useCall: false, value: value, gasLimit: gasLimit }
    txRunner.rawRun(tx, callbacks.confirmationCb, callbacks.gasEstimationForceSend, callbacks.promptCb, (error, txResult) => {
      // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
      finalCallback(error, txResult)
    })
  },

  /**
    * call the current given contract ! that will create a transaction !
    *
    * @param {String} from    - sender address
    * @param {String} to    - recipient address
    * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
    * @param {String} value    - decimal representation of value.
    * @param {String} gasLimit    - decimal representation of gas limit.
    * @param {Object} txRunner    - TxRunner.js instance
    * @param {Object} callbacks    - { confirmationCb, gasEstimationForceSend, promptCb }
    *     [validate transaction] confirmationCb (network, tx, gasEstimation, continueTxExecution, cancelCb)
    *     [transaction failed, force send] gasEstimationForceSend (error, continueTxExecution, cancelCb)
    *     [personal mode enabled, need password to continue] promptCb (okCb, cancelCb)
    * @param {Function} finalCallback    - last callback.
    */
  callFunction: function (from, to, data, value, gasLimit, funAbi, txRunner, callbacks, finalCallback) {
    var tx = { from: from, to: to, data: data, useCall: false, value: value, gasLimit: gasLimit }
    txRunner.rawRun(tx, callbacks.confirmationCb, callbacks.gasEstimationForceSend, callbacks.promptCb, (error, txResult) => {
      // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
      finalCallback(error, txResult)
    })
  },

  /**
    * check if the vm has errored
    *
    * @param {Object} txResult    - the value returned by the vm
    * @return {Object} -  { error: true/false, message: DOMNode }
    */
  checkVMError: function (txResult) {
    var errorCode = {
      OUT_OF_GAS: 'out of gas',
      STACK_UNDERFLOW: 'stack underflow',
      STACK_OVERFLOW: 'stack overflow',
      INVALID_JUMP: 'invalid JUMP',
      INVALID_OPCODE: 'invalid opcode',
      REVERT: 'revert',
      STATIC_STATE_CHANGE: 'static state change'
    }
    var ret = {
      error: false,
      message: ''
    }
    if (!txResult.result.vm.exceptionError) {
      return ret
    }
    var exceptionError = txResult.result.vm.exceptionError.error || ''
    var error = `VM error: ${exceptionError}.\n`
    var msg
    if (exceptionError === errorCode.INVALID_OPCODE) {
      msg = `\t\n\tThe execution might have thrown.\n`
      ret.error = true
    } else if (exceptionError === errorCode.OUT_OF_GAS) {
      msg = `\tThe transaction ran out of gas. Please increase the Gas Limit.\n`
      ret.error = true
    } else if (exceptionError === errorCode.REVERT) {
      var returnData = txResult.result.vm.return
      // It is the hash of Error(string)
      if (returnData && (returnData.slice(0, 4).toString('hex') === '08c379a0')) {
        var abiCoder = new ethers.utils.AbiCoder()
        var reason = abiCoder.decode(['string'], returnData.slice(4))[0]
        msg = `\tThe transaction has been reverted to the initial state.\nReason provided by the contract: "${reason}".`
      } else {
        msg = `\tThe transaction has been reverted to the initial state.\nNote: The constructor should be payable if you send value.`
      }
      ret.error = true
    } else if (exceptionError === errorCode.STATIC_STATE_CHANGE) {
      msg = `\tState changes is not allowed in Static Call context\n`
      ret.error = true
    }
    ret.message = `${error}${exceptionError}${msg}\tDebug the transaction to get more information.`
    return ret
  }
}

