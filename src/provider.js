var Web3 = require('web3')
var utils = require('ethereumjs-util')
var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext

var processTx = require('./txProcess.js')

function jsonRPCResponse(id, result) {
  return {"id":id,"jsonrpc":"2.0","result":result};
}

Provider = function() {
  this.web3 = new Web3();
  // TODO: make it random
  this.accounts = [this.web3.eth.accounts.create(["abcd"])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0];
  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex');

  // TODO: fix me; this is a temporary and very hackish thing just to get the getCode working for now
  this.deployedContracts = {};
}

Provider.prototype.sendAsync = function(payload, callback) {
  const self = this;
  //console.log("=========== sendAsync");
  //console.dir(payload);

  if (payload.method === 'eth_accounts') {
    return callback(null, jsonRPCResponse(payload.id, this.accounts.map((x) => x.address)))
  }
  if (payload.method === 'eth_estimateGas') {
    callback(null, jsonRPCResponse(payload.id, 1200000))
  }
  if (payload.method === 'eth_gasPrice') {
    callback(null, jsonRPCResponse(payload.id, 1))
  }
  if (payload.method === 'eth_sendTransaction') {
    processTx(this.accounts, payload, false, callback)
  }
  if (payload.method === 'eth_getTransactionReceipt') {
    executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
      self.deployedContracts[receipt.contractAddress] = receipt.data

      var r = { 
        "transactionHash": receipt.hash,
        "transactionIndex": "0x00",
        "blockHash": "0x766d18646a06cf74faeabf38597314f84a82c3851859d9da9d94fc8d037269e5",
        "blockNumber": "0x06",
        "gasUsed": "0x06345f",
        "cumulativeGasUsed": "0x06345f",
        "contractAddress": receipt.contractAddress,
        "logs": [],
        "status": 1
      }

      callback(null, jsonRPCResponse(payload.id, r));
    });
  }
  if (payload.method === 'eth_getCode') {
    let address = payload.params[0];
    let block   = payload.params[1];

    callback(null, jsonRPCResponse(payload.id, self.deployedContracts[address]));
  }
  if (payload.method === 'eth_call') {
    processTx(this.accounts, payload, true, callback)
  }
}

Provider.prototype.isConnected = function() {
  return true;
}

module.exports = Provider;
