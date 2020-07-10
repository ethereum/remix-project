function dummyProvider () {
  this.eth = {}
  this.debug = {}
  this.eth.getCode = (address, cb) => { return this.getCode(address, cb) }
  this.eth.getTransaction = (hash, cb) => { return this.getTransaction(hash, cb) }
  this.eth.getTransactionFromBlock = (blockNumber, txIndex, cb) => { return this.getTransactionFromBlock(blockNumber, txIndex, cb) }
  this.eth.getBlockNumber = (cb) => { return this.getBlockNumber(cb) }
  this.debug.traceTransaction = (hash, options, cb) => { return this.traceTransaction(hash, options, cb) }
  this.debug.storageRangeAt = (blockNumber, txIndex, address, start, end, maxLength, cb) => { return this.storageRangeAt(blockNumber, txIndex, address, start, end, maxLength, cb) }
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
