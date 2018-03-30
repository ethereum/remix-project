var Web3 = require('web3')
var utils = require('ethereumjs-util')
var RemixLib = require('remix-lib')
var TxExecution = RemixLib.execution.txExecution
var TxRunner = RemixLib.execution.txRunner
var executionContext = RemixLib.execution.executionContext

function jsonRPCResponse(id, result) {
  let json = {"id":id,"jsonrpc":"2.0","result":result};
  console.dir("== response");
  console.dir(json);
  return json;
}

// TODO: fix me; this is a temporary and very hackish thing just to get the getCode working for now
var deployedContracts = {
}

function processTx(accounts, payload, callback) {
  let api = {
    logMessage: (msg) => {
      //self._components.editorpanel.log({ type: 'log', value: msg })
    },
    logHtmlMessage: (msg) => {
      //self._components.editorpanel.log({ type: 'html', value: msg })
    },
    //config: self._api.config,
    config: {
      getUnpersistedProperty: (key) => {
        console.dir("== getUnpersistedProperty ==")
        console.dir(key)
        if (key === 'settings/always-use-vm') {
          return true
        }
        return true
      },
      get: () => {
        return true
      }
    },
    detectNetwork: (cb) => {
      //executionContext.detectNetwork(cb)
      cb()
    },
    personalMode: () => {
      //return self._api.config.get('settings/personal-mode')
      return false
    }
  }

  executionContext.init(api.config);

  //console.dir(accounts);
  let txRunner = new TxRunner(accounts, api);

  if (payload.params[0].to) {
    throw new Error("not implemented");
    // tx
  } else {
    console.dir("== contract creation");
    // contract creation
    let from = payload.params[0].from;
    let data = payload.params[0].data;
    let value = payload.params[0].value;
    let gasLimit = payload.params[0].gasLimit || 800000;

    let callbacks = {
      confirmationCb: (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        console.dir("confirmationCb");
        continueTxExecution(null);
      },
      gasEstimationForceSend: (error, continueTxExecution, cancelCb) => {
        console.dir("gasEstimationForceSend");
        continueTxExecution();
      },
      promptCb: (okCb, cancelCb) => {
        console.dir("promptCb");
        okCb();
      }
    }

    let finalCallback = function(err, result) {
      console.dir(arguments)
      console.log("called final callback")
      console.dir(result)
      let contractAddress = ('0x' + result.result.createdAddress.toString('hex'))
      //console.dir(contractAddress)
      console.dir(result.transactionHash)

      // TODO: fix me; this is a temporary and very hackish thing just to get the receipts working for now
      // deployedContracts[contractAddress] = contractAddress;
      callback(null, jsonRPCResponse(payload.id, result.transactionHash))
    }

    TxExecution.createContract(from, data, value, gasLimit, txRunner, callbacks, finalCallback);
  }
}

Provider = function() {
  this.web3 = new Web3();
  this.accounts = [this.web3.eth.accounts.create(["abcd"])]

  this.accounts[this.accounts[0].address.toLowerCase()] = this.accounts[0];
  //_accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer(_accounts[this.accounts[0].address.toLowerCase()].privateKey);
  this.accounts[this.accounts[0].address.toLowerCase()].privateKey = Buffer.from(this.accounts[this.accounts[0].address.toLowerCase()].privateKey.slice(2), 'hex');
}

//Provider.prototype.send = function(payload) {
//  console.log("=========== send");
//  console.dir(payload);
//  //return this.manager.request(payload);
//}

Provider.prototype.sendAsync = function(payload, callback) {
  console.log("=========== sendAsync");
  console.dir(payload);

  if (payload.method === 'eth_accounts') {
    return callback(null, jsonRPCResponse(payload.id, this.accounts.map((x) => x.address)))
  }
  if (payload.method === 'eth_estimateGas') {
    //return callback(null, jsonRPCResponseutils.bufferToInt(this.web3.utils.toHex(800000)))
    callback(null, jsonRPCResponse(payload.id, 800000))
  }
  if (payload.method === 'eth_gasPrice') {
    //return callback(null, jsonRPCResponseutils.bufferToInt(this.web3.utils.toHex(800000)))
    callback(null, jsonRPCResponse(payload.id, 1))
  }
  if (payload.method === 'eth_sendTransaction') {
    processTx(this.accounts, payload, callback)
  }
  if (payload.method === 'eth_getTransactionReceipt') {
    executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
      //console.dir(receipt);
      deployedContracts[receipt.contractAddress] = receipt.data

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

    callback(null, jsonRPCResponse(payload.id, deployedContracts[address]));
  }
  //return this.manager.request(payload, callback);
}

Provider.prototype.isConnected = function() {
  return true;
}

module.exports = Provider;
