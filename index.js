var async = require('async');
let remixLib = require('remix-lib');

let Compiler = require('./src/compiler.js');
let Deployer = require('./src/deployer.js');
let TestRunner = require('./src/testRunner.js');

var runTest = function(filename, web3) {
  let result, accounts, contracts;

  async.waterfall([
    function compile(next) {
      Compiler.compileAll(function(err, compilationResult) {
        result = compilationResult;
        next();
      });
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
      TestRunner.runTest("SimpleStorage", test, next);
    }
  ], function() {
  });
}

module.exports = {
  runTest: runTest
};
