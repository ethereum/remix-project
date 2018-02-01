var async = require('async');
require('colors');

let Compiler = require('./src/compiler.js');
let Deployer = require('./src/deployer.js');
let TestRunner = require('./src/testRunner.js');

var runTest = function(contractName, contractObj, testCallback, resultsCallback) {
  TestRunner.runTest(contractName, contractObj, testCallback, resultsCallback);
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
      var testCallback = function(result) {
        if (result.type === 'contract') {
          console.log(("#" + result.value).green);
        } else if (result.type === 'testPass') {
          console.log("\t✓ ".green.bold + result.value.grey);
        } else if (result.type === 'testFailure') {
          console.log("\t✘ ".bold.red + result.value.red);
        }
      }
      var resultsCallback = function(err, result) {
        if (err) {
          return cb(err);
        }
        if (result.passingNum > 0) {
          console.log((result.passingNum + " passing").green);
        }
        if (result.failureNum > 0) {
          console.log((result.failureNum + " failing").red);
        }
        next();
      }

      runTest(filename, contracts.MyTest, testCallback, resultsCallback);
    }
  ], function() {
  });
}

module.exports = {
  runTestFile: runTestFile,
  runTest: runTest
};
