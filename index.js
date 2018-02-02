const async = require('async');
const path = require('path');
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
      Deployer.deployAll(compilationResult, web3, function(err, contracts) {
        if (err) {
          next(err);
        }

        let contractsToTest = Object.keys(compilationResult[path.basename(filename)]);
        next(null, contractsToTest, contracts);
      });
    },
    function runTests(contractsToTest, contracts, next) {
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
      }

      async.eachLimit(contractsToTest, 1, (contractName, cb) => {
        runTest(contractName, contracts[contractName], testCallback, resultsCallback);
      }, next);
    }
  ], function() {
  });
}

module.exports = {
  runTestFile: runTestFile,
  runTest: runTest
};
