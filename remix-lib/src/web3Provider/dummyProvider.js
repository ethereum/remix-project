function dummyProvider () {
  var self = this
  this.eth = {}
  this.debug = {}
  this.eth.getCode = function (address, cb) { return self.getCode(address, cb) }
  this.eth.getTransaction = function (hash, cb) { return self.getTransaction(hash, cb) }
  this.eth.getTransactionFromBlock = function (blockNumber, txIndex, cb) { return self.getTransactionFromBlock(blockNumber, txIndex, cb) }
  this.eth.getBlockNumber = function (cb) { return self.getBlockNumber(cb) }
  this.debug.traceTransaction = function (hash, options, cb) { return self.traceTransaction(hash, options, cb) }
  this.debug.storageRangeAt = function (blockNumber, txIndex, address, start, end, maxLength, cb) { return self.storageRangeAt(blockNumber, txIndex, address, start, end, maxLength, cb) }
  this.providers = { 'HttpProvider': function (url) {} }
  this.currentProvider = {'host': ''}
}

dummyProvider.prototype.getCode = function (address, cb) {
  cb(null, '')
}

dummyProvider.prototype.setProvider = function (provider) {}

dummyProvider.prototype.traceTransaction = function (txHash, options, cb) {
  if (cb) {
    cb(null, {})
  }
  return {}
}

dummyProvider.prototype.storageRangeAt = function (blockNumber, txIndex, address, start, end, maxLength, cb) {
  if (cb) {
    cb(null, {})
  }
  return {}
}

dummyProvider.prototype.getBlockNumber = function (cb) { cb(null, '') }

dummyProvider.prototype.getTransaction = function (txHash, cb) {
  if (cb) {
    cb(null, {})
  }
  return {}
}

dummyProvider.prototype.getTransactionFromBlock = function (blockNumber, txIndex, cb) {
  if (cb) {
    cb(null, {})
  }
  return {}
}

module.exports = dummyProvider
