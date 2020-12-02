export class dummyProvider {
  eth
  debug
  providers
  currentProvider

  constructor() {
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

  getCode (address, cb) {
    cb(null, '')
  }

  setProvider (provider) {}

  traceTransaction (txHash, options, cb) {
    if (cb) {
      cb(null, {})
    }
    return {}
  }

  storageRangeAt (blockNumber, txIndex, address, start, end, maxLength, cb) {
    if (cb) {
      cb(null, {})
    }
    return {}
  }

  getBlockNumber (cb) { cb(null, '') }

  getTransaction (txHash, cb) {
    if (cb) {
      cb(null, {})
    }
    return {}
  }

  getTransactionFromBlock (blockNumber, txIndex, cb) {
    if (cb) {
      cb(null, {})
    }
    return {}
  }
}
