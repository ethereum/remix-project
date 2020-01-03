
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
}

module.exports = NodeProvider
