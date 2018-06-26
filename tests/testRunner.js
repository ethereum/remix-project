const async = require('async')
const Web3 = require('web3')
const assert = require('assert')

let Compiler = require('../src/compiler.js')
let Deployer = require('../src/deployer.js')
let TestRunner = require('../src/testRunner.js')
const Provider = require('remix-simulator').Provider

function compileAndDeploy (filename, callback) {
  let web3 = new Web3()
  web3.setProvider(new Provider())

  async.waterfall([
    function compile (next) {
      Compiler.compileFileOrFiles(filename, false, next)
    },
    function deployAllContracts (compilationResult, next) {
      Deployer.deployAll(compilationResult, web3, next)
    }
  ], function (_err, contracts) {
    callback(null, contracts)
  })
}

describe('testRunner', function () {
  describe('#runTest', function() {
    describe('test with beforeAll', function () {
      let filename = 'tests/examples_1/simple_storage_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, contracts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('MyTest', contracts.MyTest, testCallback, resultsCallback)
        })
      })

      it('should 1 passing test', function () {
        assert.equal(results.passingNum, 1)
      })

      it('should 1 failing test', function () {
        assert.equal(results.failureNum, 1)
      })

      it('should returns 3 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract',    value: 'MyTest', filename: 'simple_storage_test.sol' },
          { type: 'testPass',    value: 'Initial value should be100', time: 1, context: 'MyTest' },
          { type: 'testFailure', value: 'Initial value should be200', time: 1, context: 'MyTest', errMsg: 'function returned false' }
        ])
      })
    })

    describe('test with beforeEach', function () {
      let filename = 'tests/examples_2/simple_storage_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, contracts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('MyTest', contracts.MyTest, testCallback, resultsCallback)
        })
      })

      it('should 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 0 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })

      it('should returns 3 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract', value: 'MyTest', filename: 'simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', time: 1, context: 'MyTest' },
          { type: 'testPass', value: 'Initial value should be200', time: 1, context: 'MyTest' }
        ])
      })
    })
  })
})
