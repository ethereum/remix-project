'use strict'
module.exports = {
  retrieveVmTrace: function (blockNumber, txNumber, callBack) {
    this.context.web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
      callBack(error, result)
    })
  }
}
