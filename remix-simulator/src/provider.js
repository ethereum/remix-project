var Web3 = require('web3')
var RemixLib = require('remix-lib')
const log = require('fancy-log')
const Transactions = require('./methods/transactions.js')
const Whisper = require('./methods/whisper.js')
const merge = require('merge')

function jsonRPCResponse (id, result) {
  return {'id': id, 'jsonrpc': '2.0', 'result': result}
}

var Provider = function () {
  this.web3 = new Web3()
  // TODO: make it random
  this.accounts = [this.web3.eth.accounts.create(['abcd'])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0]
  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex')

  this.methods = {}
  this.methods = merge(this.methods, (new Transactions(this.accounts)).methods())
  this.methods = merge(this.methods, (new Whisper()).methods())
  this.methods = merge(this.methods, (new Blocks()).methods())
  log.dir(this.methods)
}

Provider.prototype.sendAsync = function (payload, callback) {
  const self = this
  log.dir('payload method is ')
  log.dir(payload.method)

  if (payload.method === 'eth_accounts') {
    log.dir('eth_accounts')
    return callback(null, jsonRPCResponse(payload.id, this.accounts.map((x) => x.address)))
  }
  if (payload.method === 'eth_estimateGas') {
    callback(null, jsonRPCResponse(payload.id, 3000000))
  }
  if (payload.method === 'eth_gasPrice') {
    callback(null, jsonRPCResponse(payload.id, 1))
  }
  if (payload.method === 'web3_clientVersion') {
    callback(null, jsonRPCResponse(payload.id, 'Remix Simulator/0.0.1'))
  }
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
