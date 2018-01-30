var async = require('async');
let remixLib = require('remix-lib');

let Compiler = require('./src/compiler.js');
let Deployer = require('./src/deployer.js');
let web3Instance = require('./src/web3Instance.js');
let TestRunner = require('./src/testRunner.js');

var runTest = function(filename) {
  let result, web3, accounts, contracts;

  async.waterfall([
    function compile(next) {
      result = Compiler.compileAll();
      next();
    },
    function initWeb3(next) {
      web3 = web3Instance();
      next();
    },
    function getAccountList(next) {
      web3.eth.getAccounts((err, _accounts) => {
        accounts = _accounts;
        next();
      });
    },
    function deployAllContracts(next) {
      Deployer.deployAll(result, web3, accounts, next);
    },
    function runTests(contracts, next) {
      let test = contracts.MyTest;
      TestRunner.runTest("SimpleStorage", test, accounts, next);
    }
  ], function() {
  });
}

module.exports = {
  runTest: runTest
};
