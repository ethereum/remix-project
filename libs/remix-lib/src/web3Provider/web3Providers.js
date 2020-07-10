const Web3VMProvider = require('./web3VmProvider')
const init = require('../init')

function Web3Providers () {
  this.modes = {}
}

Web3Providers.prototype.addProvider = function (type, obj) {
  if (type === 'INTERNAL') {
    const web3 = init.loadWeb3()
    this.addWeb3(type, web3)
  } else if (type === 'vm') {
    this.addVM(type, obj)
  } else {
    init.extendWeb3(obj)
    this.addWeb3(type, obj)
  }
}

Web3Providers.prototype.get = function (type, cb) {
  if (this.modes[type]) {
    cb(null, this.modes[type])
  } else {
    cb('error: this provider has not been setup (' + type + ')', null)
  }
}

Web3Providers.prototype.addWeb3 = function (type, web3) {
  this.modes[type] = web3
}

Web3Providers.prototype.addVM = function (type, vm) {
  const vmProvider = new Web3VMProvider()
  vmProvider.setVM(vm)
  this.modes[type] = vmProvider
}

module.exports = Web3Providers
