const async = require('async')
const path = require('path')
const fs = require('fs')
require('colors')

let Compiler = require('./src/compiler.js')
let Deployer = require('./src/deployer.js')
let TestRunner = require('./src/testRunner.js')

var runTestFiles = function(filepath, is_directory, web3) {
  async.waterfall([
    function compile (next) {
      if (is_directory) {
        Compiler.compileFiles(filepath, next)
      } else {
        Compiler.compileFile(filepath, next)
      }
    },
    function deployAllContracts (compilationResult, next) {
      Deployer.deployAll(compilationResult, web3, function (err, contracts) {
        if (err) {
          next(err)
        }

        let contractsToTest = []
        if (is_directory) {
          fs.readdirSync(filepath).forEach(filename => {
            if (filename.indexOf('_test.sol') < 0) {
              return
            }
            Object.keys(compilationResult[path.basename(filename)]).forEach(contractName => {
              contractsToTest.push(contractName)
            })
          })
        } else {
          contractsToTest = Object.keys(compilationResult[path.basename(filepath)])
        }

        next(null, contractsToTest, contracts)
      })
    },
    function runTests (contractsToTest, contracts, next) {
      var testCallback = function (result) {
        if (result.type === 'contract') {
          console.log('\n  ' + result.value)
        } else if (result.type === 'testPass') {
          console.log('\t✓ '.green.bold + result.value.grey)
        } else if (result.type === 'testFailure') {
          console.log('\t✘ '.bold.red + result.value.red)
        }
      }
      var resultsCallback = function (_err, result, cb) {
        if (result.passingNum > 0) {
          console.log((result.passingNum + ' passing').green)
        }
        if (result.failureNum > 0) {
          console.log((result.failureNum + ' failing').red)
        }
        cb()
      }

      async.eachOfLimit(contractsToTest, 1, (contractName, index, cb) => {
        TestRunner.runTest(contractName, contracts[contractName], testCallback, (err, result) => {
          if (err) {
            return cb(err)
          }
          resultsCallback(null, result, cb)
        })
      }, next)
    }
  ], function () {
  })
}

module.exports = {
  runTestFiles: runTestFiles,
  runTest: TestRunner.runTest
}
