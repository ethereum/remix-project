
class VMProvider {

  constructor (executionContext) {
    this.executionContext = executionContext
    this.accounts = {}
  }

  getAccounts (cb) {
    if (!this.accounts) {
      cb('No accounts?')
      return cb('No accounts?')
    }
    return cb(null, Object.keys(this.accounts))
  }
}

module.exports = VMProvider
