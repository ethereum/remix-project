var Web3VMProvider = require('./web3VmProvider')

function Web3Provider () {
  var self = this
  this.currentMode
  this.actions = {}
  this.modes = {}
  this.currentProvider = {'host': 'browser-solidity proxy provider'}
  this.providers = { 'HttpProvider': function (url) {} }
  this.eth = {}
  this.debug = {}
  this.eth.getCode = function (address, cb) { if (self.check(cb)) { return self.actions[self.currentMode]['eth.getCode'].apply(self.executingMode(), arguments) } }
  this.setProvider = function (provider) { if (self.check()) { return self.actions[self.currentMode]['setProvider'].apply(self.executingMode(), [provider]) } }
  this.debug.traceTransaction = function (txHash, options, cb) { if (self.check()) { return self.actions[self.currentMode]['debug.traceTransaction'].apply(self.executingMode(), arguments) } }
  this.debug.storageAt = function (blockNumber, txIndex, address, cb) { if (self.check()) { return self.actions[self.currentMode]['debug.storageAt'].apply(self.executingMode(), arguments) } }
  this.eth.getTransaction = function (txHash) { if (self.check()) { return self.actions[self.currentMode]['eth.getTransaction'].apply(self.executingMode(), arguments) } }
  this.eth.getTransactionFromBlock = function (blockNumber, txIndex) { if (self.check()) { return self.actions[self.currentMode]['eth.getTransactionFromBlock'].apply(self.executingMode(), arguments) } }
  this.eth.getBlockNumber = function (cb) { if (self.check()) { return self.actions[self.currentMode]['eth.getBlockNumber'].apply(self.executingMode(), arguments) } }
}

Web3Provider.prototype.check = function (cb) {
  if (!this.currentMode) {
    if (cb) {
      cb('error: no provider has been setup ', null)
    }
    return false
  }
  return true
}

Web3Provider.prototype.switchTo = function (type, cb) {
  if (this.actions[type]) {
    this.currentMode = type
    cb(null, 'ok')
  } else {
    cb('error: this provider has not been setup (' + type + ')', null)
  }
}

Web3Provider.prototype.executingMode = function () {
  return this.modes[this.currentMode]
}

Web3Provider.prototype.initWeb3 = function (web3) {
  this.actions['EXTERNAL'] = {}
  this.actions['EXTERNAL']['eth.getCode'] = web3.eth.getCode
  this.actions['EXTERNAL']['setProvider'] = web3.setProvider
  this.actions['EXTERNAL']['debug.traceTransaction'] = web3.debug.traceTransaction
  this.actions['EXTERNAL']['debug.storageAt'] = web3.debug.storageAt
  this.actions['EXTERNAL']['eth.getTransaction'] = web3.eth.getTransaction
  this.actions['EXTERNAL']['eth.getTransactionFromBlock'] = web3.eth.getTransactionFromBlock
  this.actions['EXTERNAL']['eth.getBlockNumber'] = web3.eth.getBlockNumber
  this.modes['EXTERNAL'] = web3
}

Web3Provider.prototype.initVM = function (vm) {
  var vmProvider = new Web3VMProvider()
  vmProvider.setVM(vm)
  this.actions['VM'] = {}
  this.actions['VM']['eth.getCode'] = vmProvider.getCode
  this.actions['VM']['setProvider'] = vmProvider.setProvider
  this.actions['VM']['debug.traceTransaction'] = vmProvider.traceTransaction
  this.actions['VM']['debug.storageAt'] = vmProvider.storageAt
  this.actions['VM']['eth.getTransaction'] = vmProvider.getTransaction
  this.actions['VM']['eth.getTransactionFromBlock'] = vmProvider.getTransactionFromBlock
  this.actions['VM']['eth.getBlockNumber'] = vmProvider.getBlockNumber
  this.modes['VM'] = vmProvider
}

module.exports = Web3Provider
