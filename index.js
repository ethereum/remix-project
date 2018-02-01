var async = require('async');

let Compiler = require('./src/compiler.js');
let Deployer = require('./src/deployer.js');
let TestRunner = require('./src/testRunner.js');

var runTest = function(contractName, contractObj, cb) {
  TestRunner.runTest(contractName, contractObj, cb);
}

var runTestFile = function(filename, web3) {
  async.waterfall([
    function compile(next) {
      Compiler.compileFile(filename, next);
    },
    function deployAllContracts(compilationResult, next) {
      Deployer.deployAll(compilationResult, web3, next);
    },
    function runTests(contracts, next) {
      runTest("SimpleStorage", contracts.MyTest, next);
    }
  ], function() {
  });
}

module.exports = {
  runTestFile: runTestFile,
  runTest: runTest
};
