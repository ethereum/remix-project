var Web3 = require('web3')
var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext

var processTx = require('./txProcess.js')

function jsonRPCResponse (id, result) {
  return {'id': id, 'jsonrpc': '2.0', 'result': result}
}

var Provider = function () {
  this.web3 = new Web3()
  // TODO: make it random
  this.accounts = [this.web3.eth.accounts.create(['abcd'])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0]
  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex')

  // TODO: fix me; this is a temporary and very hackish thing just to get the getCode working for now
  this.deployedContracts = {}
}

Provider.prototype.sendAsync = function (payload, callback) {
  const self = this
  console.dir('payload method is ')
  console.dir(payload.method)

  if (payload.method === 'eth_accounts') {
    console.dir('eth_accounts')
    return callback(null, jsonRPCResponse(payload.id, this.accounts.map((x) => x.address)))
  }
  if (payload.method === 'eth_estimateGas') {
    callback(null, jsonRPCResponse(payload.id, 3000000))
  }
  if (payload.method === 'eth_gasPrice') {
    callback(null, jsonRPCResponse(payload.id, 1))
  }
  if (payload.method === 'eth_sendTransaction') {
    processTx(this.accounts, payload, false, callback)
  }
  if (payload.method === 'eth_getTransactionReceipt') {
    executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
      if (error) {
        return callback(error)
      }
      self.deployedContracts[receipt.contractAddress] = receipt.data

      var r = {
        'transactionHash': receipt.hash,
        'transactionIndex': '0x00',
        'blockHash': '0x766d18646a06cf74faeabf38597314f84a82c3851859d9da9d94fc8d037269e5',
        'blockNumber': '0x06',
        'gasUsed': '0x06345f',
        'cumulativeGasUsed': '0x06345f',
        'contractAddress': receipt.contractAddress,
        'logs': [],
        'status': 1
      }

      callback(null, jsonRPCResponse(payload.id, r))
    })
  }
  if (payload.method === 'eth_getCode') {
    let address = payload.params[0]
    // let block = payload.params[1]

    callback(null, jsonRPCResponse(payload.id, self.deployedContracts[address] || '0x'))
  }
  if (payload.method === 'eth_call') {
    processTx(this.accounts, payload, true, callback)
  }
  if (payload.method === 'web3_clientVersion') {
    callback(null, jsonRPCResponse(payload.id, 'Remix Simulator/0.0.1'))
  }
  if (payload.method === 'shh_version') {
    callback(null, jsonRPCResponse(payload.id, 5))
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
}

Provider.prototype.isConnected = function () {
  return true
}

module.exports = Provider
