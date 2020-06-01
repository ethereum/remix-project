import 'mocha'
import * as async from 'async'
import Web3 from 'web3';
import * as assert from 'assert'
import { Provider } from 'remix-simulator'

import { compileFileOrFiles } from '../dist/compiler'
import { deployAll } from '../dist/deployer'
import { runTest, compilationInterface } from '../dist/index'
import { ResultsInterface, TestCbInterface, ResultCbInterface } from '../dist/index'

// deepEqualExcluding allows us to exclude specific keys whose values vary.
// In this specific test, we'll use this helper to exclude `time` keys.
// Assertions for the existance of these will be made at the correct places.
function deepEqualExcluding(a: any, b: any, excludedKeys: string[]) {
  function removeKeysFromObject(obj: any, excludedKeys: string[]) {
    if (obj !== Object(obj)) {
      return obj
    }

    if(Object.prototype.toString.call(obj) !== '[object Array]') {
      obj = Object.assign({}, obj)
      for (const key of excludedKeys) {
        delete obj[key]
      }

      return obj
    }

    let newObj = []
    for (const idx in obj) {
      newObj[idx] = removeKeysFromObject(obj[idx], excludedKeys);
    }

    return newObj
  }

  let aStripped: any = removeKeysFromObject(a, excludedKeys);
  let bStripped: any = removeKeysFromObject(b, excludedKeys);
  assert.deepEqual(aStripped, bStripped)
}

let accounts: string[]
let provider = new Provider()

async function compileAndDeploy(filename: string, callback: Function) {
  let web3: Web3 = new Web3()
  let sourceASTs: any = {}
  await provider.init()
  web3.setProvider(provider)
  let compilationData: object
  async.waterfall([
    function getAccountList(next: Function): void {
      web3.eth.getAccounts((_err: Error | null | undefined, _accounts: string[]) => {
        accounts = _accounts
        web3.eth.defaultAccount = accounts[0]
        next(_err)
      })
    },
    function compile(next: Function): void {
      compileFileOrFiles(filename, false, { accounts }, next)
    },
    function deployAllContracts(compilationResult: compilationInterface, asts, next: Function): void {
      for(const filename in asts) {
        if(filename.endsWith('_test.sol'))
          sourceASTs[filename] = asts[filename].ast
      }
      try {
        compilationData = compilationResult
        deployAll(compilationResult, web3, false, next)
      } catch (e) {
        throw e
      }
    }
  ], function (_err: Error | null | undefined, contracts: any): void {
    callback(null, compilationData, contracts, sourceASTs, accounts)
  })
}


describe('testRunner', () => {
    let tests: any[] = [], results: ResultsInterface;

    const testCallback: TestCbInterface = (err, test) => {
      if (err) { throw err }

      if (test.type === 'testPass' || test.type === 'testFailure') {
        assert.ok(test.time, 'test time not reported')
        assert.ok(!Number.isInteger(test.time || 0), 'test time should not be an integer')
      }

      tests.push(test)
    }

    const resultsCallback: Function = (done) => {
      return (err, _results) => {
        if (err) { throw err }
        results = _results
        done()
      }
    }

    describe('#runTest', () => {
    describe('test with beforeAll', () => {
      const filename: string = 'tests/examples_1/simple_storage_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) => {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 3 passing test', function () {
        assert.equal(results.passingNum, 3)
      })

      it('should have 1 failing test', function () {
        assert.equal(results.failureNum, 1)
      })

      it('should return 6 messages', function () {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'MyTest', filename: 'tests/examples_1/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', context: 'MyTest' },
          { type: 'testPass', value: 'Initial value should not be200', context: 'MyTest' },
          { type: 'testFailure', value: 'Should trigger one fail', errMsg: 'uint test 1 fails', context: 'MyTest' },
          { type: 'testPass', value: 'Should trigger one pass', context: 'MyTest' }
        ], ['time'])
      })
    })

    describe('test with beforeEach', function () {
      const filename: string = 'tests/examples_2/simple_storage_test.sol'

      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 0 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })

      it('should return 4 messages', function () {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'MyTest', filename: 'tests/examples_2/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', context: 'MyTest' },
          { type: 'testPass', value: 'Value is set200', context: 'MyTest' }
        ], ['time'])
      })
    })

    // Test string equality
    describe('test string equality', function () {
      const filename: string = 'tests/examples_3/simple_string_test.sol'

      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('StringTest', contracts.StringTest, compilationData[filename]['StringTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should return 4 messages', function () {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StringTest', filename: 'tests/examples_3/simple_string_test.sol' },
          { type: 'testPass', value: 'Initial value should be hello world', context: 'StringTest' },
          { type: 'testPass', value: 'Value should not be hello wordl', context: 'StringTest' }
        ], ['time'])
      })
    })

    // Test multiple directory import in test contract
    describe('test multiple directory import in test contract', function () {
      const filename: string = 'tests/examples_5/test/simple_storage_test.sol'

      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('StorageResolveTest', contracts.StorageResolveTest, compilationData[filename]['StorageResolveTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should 3 passing tests', function () {
        assert.equal(results.passingNum, 3)
      })

      it('should return 4 messages', function () {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StorageResolveTest', filename: 'tests/examples_5/test/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', context: 'StorageResolveTest' },
          { type: 'testPass', value: 'Check if even', context: 'StorageResolveTest' },
          { type: 'testPass', value: 'Check if odd', context: 'StorageResolveTest' }
        ], ['time'])
      })
    })

    //Test signed/unsigned integer weight
    describe('test number weight', function () {
      const filename: string = 'tests/number/number_test.sol'

      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('IntegerTest', contracts.IntegerTest, compilationData[filename]['IntegerTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 6 passing tests', function () {
        assert.equal(results.passingNum, 6)
      })
      it('should have 2 failing tests', function () {
        assert.equal(results.failureNum, 2)
      })
    })

    // Test Transaction with custom sender & value
    describe('various sender', function () {
      const filename: string = 'tests/various_sender/sender_and_value_test.sol'

      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('SenderAndValueTest', contracts.SenderAndValueTest, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 17 passing tests', function () {
        assert.equal(results.passingNum, 17)
      })
      it('should have 0 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })
    })

    // Test `runTest` method without sending contract object (should throw error)
    describe('runTest method without contract json interface', function () {
      const filename: string = 'tests/various_sender/sender_and_value_test.sol'
      const errorCallback: Function = (done) => {
        return (err, _results) => {
          if (err && err.message.includes('Contract interface not available')) { 
            results = _results
            done() 
          }
          else throw err
        }
      }
      before(function (done) {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[]) {
          runTest('SenderAndValueTest', undefined, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts }, testCallback, errorCallback(done))
        })
      })

      it('should have 0 passing tests', function () {
        assert.equal(results.passingNum, 0)
      })
      it('should have 0 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })
    })
  })
})
