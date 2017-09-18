'use strict'

module.exports = {
  /**
    * deploy the given contract
    *
    * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
    * @param {Object} udap    - udapp.
    * @param {Function} callback    - callback.
    */
  createContract: function (data, udapp, callback) {
    udapp.runTx({data: data, useCall: false}, (error, txResult) => {
      // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
      callback(error, txResult)
    })
  },

  /**
    * call the current given contract
    *
    * @param {String} to    - address of the contract to call.
    * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
    * @param {Object} funAbi    - abi definition of the function to call.
    * @param {Object} udap    - udapp.
    * @param {Function} callback    - callback.
    */
  callFunction: function (to, data, funAbi, udapp, callback) {
    udapp.runTx({to: to, data: data, useCall: funAbi.constant}, (error, txResult) => {
      // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
      callback(error, txResult)
    })
  },

  /**
    * check if the vm has errored
    *
    * @param {Object} txResult    - the value returned by the vm
    * @return {Object} -  { error: true/false, message: DOMNode }
    */
  checkVMError: function (txResult) {
    var ret = {
      error: false,
      message: ''
    }
    if (!txResult.result.vm.exceptionError) {
      return ret
    }
    var error = `VM error: ${txResult.result.vm.exceptionError}.\n`
    var msg
    if (txResult.result.vm.exceptionError === 'invalid opcode') {
      msg = `\tThe constructor should be payable if you send value.\n\tThe execution might have thrown.\n`
      ret.error = true
    } else if (txResult.result.vm.exceptionError === 'out of gas') {
      msg = `\tThe transaction ran out of gas. Please increase the Gas Limit.\n`
      ret.error = true
    }
    ret.message = `${error}${msg}\tDebug the transaction to get more information.`
    return ret
  }
}
