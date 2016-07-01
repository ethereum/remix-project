var init = {
  overrideWeb3: function (web3, web3Override) {
    web3.eth.getCode = web3Override.getCode
    web3.debug.traceTransaction = web3Override.traceTransaction
    web3.debug.storageAt = web3Override.storageAt
    web3.eth.getTransaction = web3Override.getTransaction
    web3.eth.getTransactionFromBlock = web3Override.getTransactionFromBlock
    web3.eth.getBlockNumber = web3Override.getBlockNumber
  }
}

module.exports = init
