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
        assert.equal(results.passingNum, 2)
      })

      it('should 1 failing test', function () {
        assert.equal(results.failureNum, 2)
      })

      it('should returns 5 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract',    value: 'MyTest', filename: 'simple_storage_test.sol' },
          { type: 'testFailure', value: 'Should trigger one fail', time: 1, context: 'MyTest', errMsg: 'the test 1 fails' },
          { type: 'testPass',    value: 'Should trigger one pass', time: 1, context: 'MyTest'},
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

    // Test string equality
    describe('test string equality', function () {
      let filename = 'tests/examples_3/simple_string_test.sol'
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
          TestRunner.runTest('StringTest', contracts.StringTest, testCallback, resultsCallback)
          TestRunner.runTest('StringTest2', contracts.StringTest2, testCallback, resultsCallback)
        })
      })

      it('should 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 1 failing tests', function () {
        assert.equal(results.failureNum, 1)
      })

      it('should returns 3 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract', value: 'StringTest', filename: 'simple_string_test.sol' },
          { type: 'testFailure', value: 'Value should be hello world', time: 1, context: 'StringTest', "errMsg": "function returned false" },
          { type: 'testPass', value: 'Value should not be hello world', time: 1, context: 'StringTest' },
          { type: 'testPass', value: 'Initial value should be hello', time: 1, context: 'StringTest' },
        ])
      })
    })

    // Test signed/unsigned integer weight
    describe('test number weight', function () {
      let filename = 'tests/number/number_test.sol'
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
          TestRunner.runTest('IntegerTest', contracts.IntegerTest, testCallback, resultsCallback)
        })
      })

      it('should have 6 passing tests', function () {
        assert.equal(results.passingNum, 6)
      })
      it('should have 2 failing tests', function () {
        assert.equal(results.failureNum, 2)
      })
    })
  })
})
