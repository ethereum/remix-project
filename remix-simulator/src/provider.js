var RemixLib = require('remix-lib')
const log = require('fancy-log')
const Accounts = require('./methods/accounts.js')
const Blocks = require('./methods/blocks.js')
const Misc = require('./methods/misc.js')
const Transactions = require('./methods/transactions.js')
const Whisper = require('./methods/whisper.js')
const merge = require('merge')

function jsonRPCResponse (id, result) {
  return {'id': id, 'jsonrpc': '2.0', 'result': result}
}

var Provider = function () {
  this.Accounts = new Accounts();

  this.methods = {}
  this.methods = merge(this.methods, this.Accounts.methods())
  this.methods = merge(this.methods, (new Blocks()).methods())
  this.methods = merge(this.methods, (new Misc()).methods())
  this.methods = merge(this.methods, (new Transactions(this.Accounts.accounts)).methods())
  this.methods = merge(this.methods, (new Whisper()).methods())
  log.dir(this.methods)
}

Provider.prototype.sendAsync = function (payload, callback) {
  const self = this
  log.dir('payload method is ')
  log.dir(payload.method)

  let method = this.methods[payload.method]
  if (method) {
    return method.call(method, payload, (err, result) => {
      if (err) {
        return callback({error: err})
      }
      callback(null, jsonRPCResponse(payload.id, result))
    });
  }
  callback("unknown method " + payload.method);
}

Provider.prototype.isConnected = function () {
  return true
}

module.exports = Provider
