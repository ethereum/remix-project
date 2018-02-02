const async = require('async');
const path = require('path');
const fs = require('fs');
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
          console.log(("\t  " + result.value).green);
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

var runTestFiles = function(directory, web3) {
  async.waterfall([
    function compile(next) {
      Compiler.compileFiles(directory, next);
    },
    function deployAllContracts(compilationResult, next) {
      Deployer.deployAll(compilationResult, web3, function(err, contracts) {
        if (err) {
          next(err);
        }

        let contractsToTest = [];
        fs.readdirSync(directory).forEach(filename => {
          if (filename.indexOf('_test.sol') < 0) {
            return;
          }
          Object.keys(compilationResult[path.basename(filename)]).forEach(contractName => {
            contractsToTest.push(contractName)
          })
        })

        next(null, contractsToTest, contracts);
      });
    },
    function runTests(contractsToTest, contracts, next) {
      var testCallback = function(result) {
        if (result.type === 'contract') {
          console.log("\n  " + result.value);
        } else if (result.type === 'testPass') {
          console.log("\t✓ ".green.bold + result.value.grey);
        } else if (result.type === 'testFailure') {
          console.log("\t✘ ".bold.red + result.value.red);
        }
      }
      var resultsCallback = function(_err, result, cb) {
        if (result.passingNum > 0) {
          console.log((result.passingNum + " passing").green);
        }
        if (result.failureNum > 0) {
          console.log((result.failureNum + " failing").red);
        }
        cb();
      }

      async.eachOfLimit(contractsToTest, 1, (contractName, index, cb) => {
        runTest(contractName, contracts[contractName], testCallback, (err, result) => {
          if (err) {
            return cb(err);
          }
          resultsCallback(null, result, cb);
        });
      }, next);
    }
  ], function() {
  });
}

module.exports = {
  runTestFile: runTestFile,
  runTestFiles: runTestFiles,
  runTest: runTest
};
