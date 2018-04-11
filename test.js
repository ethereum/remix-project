var async = require('async')
const Web3 = require('web3')
const Provider = require('./src/provider.js')
const Compiler = require('./src/compiler.js')

let web3 = new Web3()
web3.setProvider(new Provider())
let accounts = [];

async.waterfall([
  function compileContract(next) {
   Compiler.compileFileOrFiles('test.sol', false, next);
  },
  function getAccounts(contracts, next) {
    web3.eth.getAccounts((err, _accounts) => {
      accounts = _accounts;
      next(null, contracts);
    });
  },
  function deployContract(contracts, next) {
    let contract = contracts['test.sol'].SimpleStorage;
    let abi = contract.abi;
    let code = contract.evm.bytecode.object;

    console.dir(contracts);
  
    let contractObject = new web3.eth.Contract(abi)
    let deployObject = contractObject.deploy({arguments: [], data: code})

    deployObject.send({
      from: accounts[0],
      gas: 1200000
    }).on('receipt', function (receipt) {
      console.dir("==== got the receipt");
      console.dir(receipt);

      contractObject.options.address = receipt.contractAddress
      contractObject.options.from = accounts[0]
      contractObject.options.gas = 5000 * 1000
      //next(null, receipt.contractAddress);
      next(null, contractObject);
    })
  },
  function callContract(contract, next) {
    console.dir('==============');
    console.dir(contract);

    //contract.methods.storedData().call(console.dir);
    //contract.methods.get().call(console.dir);
    contract.methods.set(50).send({from: accounts[0]}).then(() => {
      console.dir('value was set');
      next(null, contract);
    });
  },
  function callContract2(contract, next) {
    contract.methods.get2().call(console.dir);
    next(null, contract);
  }
], function(err, results) {
  //console.dir(arguments);
});

