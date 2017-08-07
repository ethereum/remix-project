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
  }
}
