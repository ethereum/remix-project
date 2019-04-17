const log = require('./utils/logs.js')
const merge = require('merge')

const Accounts = require('./methods/accounts.js')
const Blocks = require('./methods/blocks.js')
const Misc = require('./methods/misc.js')
const Net = require('./methods/net.js')
const Transactions = require('./methods/transactions.js')
const Whisper = require('./methods/whisper.js')

var Provider = function (options) {
  this.Accounts = new Accounts()

  this.methods = {}
  this.methods = merge(this.methods, this.Accounts.methods())
  this.methods = merge(this.methods, (new Blocks(options)).methods())
  this.methods = merge(this.methods, (new Misc()).methods())
  this.methods = merge(this.methods, (new Net()).methods())
  this.methods = merge(this.methods, (new Transactions(this.Accounts.accounts)).methods())
  this.methods = merge(this.methods, (new Whisper()).methods())
}

Provider.prototype.sendAsync = function (payload, callback) {
  log.info('payload method is ', payload.method)

  let method = this.methods[payload.method]
  if (method) {
    return method.call(method, payload, (err, result) => {
      if (err) {
        return callback(err)
      }
      let response = {'id': payload.id, 'jsonrpc': '2.0', 'result': result}
      callback(null, response)
    })
  }
  callback(new Error('unknown method ' + payload.method))
}

Provider.prototype.send = function (payload, callback) {
  this.sendAsync(payload, callback || function () {})
}

Provider.prototype.isConnected = function () {
  return true
}

module.exports = Provider
