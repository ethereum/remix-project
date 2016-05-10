module.exports = {
  retrieveVmTrace: function (blockNumber, txNumber, callBack) {
    web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
      callBack(error, result)
    })
  }
}
