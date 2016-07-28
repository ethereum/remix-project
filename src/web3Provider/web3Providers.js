var Web3VMProvider = require('./web3VmProvider')
var init = require('../helpers/init')

function Web3Providers () {
  this.modes = {}
}

Web3Providers.prototype.addProvider = function (type, obj) {
  if (type === 'INTERNAL') {
    var web3 = init.loadWeb3()
    this.addWeb3(type, web3)
  } else if (type === 'EXTERNAL') {
    init.extendWeb3(obj)
    this.addWeb3(type, obj)
  } else if (type === 'VM') {
    this.addVM(obj)
  } else {
    this.addWeb3(type, obj)
  }
}

Web3Providers.prototype.get = function (type, cb) {
  if (this.modes[type]) {
    this.currentMode = type
    cb(null, this.modes[type])
  } else {
    cb('error: this provider has not been setup (' + type + ')', null)
  }
}

Web3Providers.prototype.addWeb3 = function (type, web3) {
  this.modes[type] = web3
}

Web3Providers.prototype.addVM = function (vm) {
  var vmProvider = new Web3VMProvider()
  vmProvider.setVM(vm)
  this.modes['VM'] = vmProvider
}

module.exports = Web3Providers
