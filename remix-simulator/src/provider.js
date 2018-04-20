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
  if (payload.method === 'eth_getBlockByNumber') {
    let b = {
      'difficulty': '0x0',
      'extraData': '0x',
      'gasLimit': '0x7a1200',
      'gasUsed': '0x0',
      'hash': '0xdb731f3622ef37b4da8db36903de029220dba74c41185f8429f916058b86559f',
      'logsBloom': '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'miner': '0x3333333333333333333333333333333333333333',
      'mixHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
      'nonce': '0x0000000000000042',
      'number': '0x0',
      'parentHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
      'receiptsRoot': '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      'sha3Uncles': '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
      'size': '0x1f8',
      'stateRoot': '0xb7917653f92e62394d2207d0f39a1320ff1cb93d1cee80d3c492627e00b219ff',
      'timestamp': '0x0',
      'totalDifficulty': '0x0',
      'transactions': [],
      'transactionsRoot': '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      'uncles': []
    }
    callback(null, jsonRPCResponse(payload.id, b))
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
