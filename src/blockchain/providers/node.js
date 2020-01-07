const Web3 = require('web3')

class NodeProvider {

  constructor (executionContext, config) {
    this.executionContext = executionContext
    this.config = config
  }

  getAccounts (cb) {
    if (this.config.get('settings/personal-mode')) {
      return this.executionContext.web3().personal.getListAccounts(cb)
    }
    return this.executionContext.web3().eth.getAccounts(cb)
  }

  resetEnvironment () {
  }

  getBalanceInEther(address, cb) {
    address = stripHexPrefix(address)
    this.executionContext.web3().eth.getBalance(address, (err, res) => {
      if (err) {
        return cb(err)
      }
      cb(null, Web3.utils.fromWei(res.toString(10), 'ether'))
    })
  }
}

module.exports = NodeProvider
