var async = require('async');
let remixLib = require('remix-lib');

let Compiler = require('./src/compiler.js');
let Deployer = require('./src/deployer.js');
let TestRunner = require('./src/testRunner.js');

var runTest = function(contractName, contractObj, cb) {
  TestRunner.runTest(contractName, contractObj, cb);
}

var runTestFile = function(filename, web3) {
  let result, accounts, contracts;

  async.waterfall([
    function compile(next) {
      Compiler.compileAll(function(err, compilationResult) {
        result = compilationResult;
        next();
      });
    },
    function deployAllContracts(next) {
      Deployer.deployAll(result, web3, next);
    },
    function runTests(contracts, next) {
      runTest("SimpleStorage", contracts.MyTest, next);
    }
  ], function() {
  });
}


module.exports = {
  runTestFile: runTestFile
};
