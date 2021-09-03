import * as async from 'async'
import Web3 from 'web3';
import * as assert from 'assert'
import { Provider, extend } from '@remix-project/remix-simulator'

import { compileFileOrFiles } from '../src/compiler'
import { deployAll } from '../src/deployer'
import { runTest, compilationInterface } from '../src/index'
import { ResultsInterface, TestCbInterface, ResultCbInterface } from '../src/index'

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
let provider: any = new Provider()

async function compileAndDeploy(filename: string, callback: Function) {
  let web3: Web3 = new Web3()
  let sourceASTs: any = {}
  await provider.init()
  web3.setProvider(provider)
  extend(web3)
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
      compileFileOrFiles(filename, false, { accounts }, null, next)
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
    callback(null, compilationData, contracts, sourceASTs, accounts, web3)
  })
}

// Use `export NODE_OPTIONS="--max-old-space-size=4096"` if there is a JavaScript heap out of memory issue

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

      describe('assert library OK method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_ok_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertOkTest', contracts.AssertOkTest, compilationData[filename]['AssertOkTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 1 passing test', () => {
        assert.equal(results.passingNum, 1)
      })

      it('should have 1 failing test', () => {
        assert.equal(results.failureNum, 1)
      })

      const hhLogs1 = [ [ "AssertOkTest", "okPassTest"]]
      const hhLogs2 = [ [ "AssertOkTest", "okFailTest"]]
      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertOkTest', filename: __dirname + '/examples_0/assert_ok_test.sol' },
          { type: 'testPass', value: 'Ok pass test', filename: __dirname + '/examples_0/assert_ok_test.sol', context: 'AssertOkTest', hhLogs: hhLogs1 },
          { type: 'testFailure', value: 'Ok fail test', filename: __dirname + '/examples_0/assert_ok_test.sol', errMsg: 'okFailTest fails', context: 'AssertOkTest', hhLogs: hhLogs2, assertMethod: 'ok', location: '370:36:0', expected: 'true', returned: 'false'},
          
        ], ['time', 'web3'])
      })
    })

    describe('assert library EQUAL method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_equal_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertEqualTest', contracts.AssertEqualTest, compilationData[filename]['AssertEqualTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 6 passing test', () => {
        assert.equal(results.passingNum, 6)
      })

      it('should have 6 failing test', () => {
        assert.equal(results.failureNum, 6)
      })

      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertEqualTest', filename: __dirname + '/examples_0/assert_equal_test.sol' },
          { type: 'testPass', value: 'Equal uint pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal uint fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalUintFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '273:57:0', expected: '2', returned: '1'},
          { type: 'testPass', value: 'Equal int pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal int fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalIntFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '493:45:0', expected: '2', returned: '-1'},
          { type: 'testPass', value: 'Equal bool pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal bool fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBoolFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '708:52:0', expected: false, returned: true},
          { type: 'testPass', value: 'Equal address pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal address fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalAddressFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1015:130:0', expected: '0x1c6637567229159d1eFD45f95A6675e77727E013', returned: '0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9'},
          { type: 'testPass', value: 'Equal bytes32 pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal bytes32 fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBytes32FailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1670:48:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6979000000000000000000000000000000000000000000000000000000'},
          { type: 'testPass', value: 'Equal string pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', value: 'Equal string fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalStringFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1916:81:0', expected: 'remix-tests', returned: 'remix'}
        ], ['time', 'web3'])
      })
    })

    describe('assert library NOTEQUAL method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_notEqual_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertNotEqualTest', contracts.AssertNotEqualTest, compilationData[filename]['AssertNotEqualTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 6 passing test', () => {
        assert.equal(results.passingNum, 6)
      })

      it('should have 6 failing test', () => {
        assert.equal(results.failureNum, 6)
      })

      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertNotEqualTest', filename: __dirname + '/examples_0/assert_notEqual_test.sol' },
          { type: 'testPass', value: 'Not equal uint pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal uint fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualUintFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '288:63:0', expected: '1', returned: '1'},
          { type: 'testPass', value: 'Not equal int pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal int fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualIntFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '525:52:0', expected: '-2', returned: '-2'},
          { type: 'testPass', value: 'Not equal bool pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal bool fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBoolFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '760:57:0', expected: true, returned: true},
          { type: 'testPass', value: 'Not equal address pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal address fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualAddressFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1084:136:0', expected: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, returned: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9},
          { type: 'testPass', value: 'Not equal bytes32 pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal bytes32 fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBytes32FailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1756:54:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6978000000000000000000000000000000000000000000000000000000'},
          { type: 'testPass', value: 'Not equal string pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', value: 'Not equal string fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualStringFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '2026:81:0', expected: 'remix', returned: 'remix'},
        ], ['time', 'web3'])
      })
    })

    describe('assert library GREATERTHAN method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_greaterThan_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertGreaterThanTest', contracts.AssertGreaterThanTest, compilationData[filename]['AssertGreaterThanTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 4 passing test', () => {
        assert.equal(results.passingNum, 4)
      })

      it('should have 4 failing test', () => {
        assert.equal(results.failureNum, 4)
      })
      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertGreaterThanTest', filename: __dirname + '/examples_0/assert_greaterThan_test.sol' },
          { type: 'testPass', value: 'Greater than uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', value: 'Greater than uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '303:69:0', expected: '4', returned: '1'},
          { type: 'testPass', value: 'Greater than int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', value: 'Greater than int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '569:67:0', expected: '1', returned: '-1'},
          { type: 'testPass', value: 'Greater than uint int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', value: 'Greater than uint int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '845:71:0', expected: '2', returned: '1'},
          { type: 'testPass', value: 'Greater than int uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', value: 'Greater than int uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '1125:76:0', expected: '115792089237316195423570985008687907853269984665640564039457584007913129639836', returned: '100'}
        ], ['time', 'web3'])
      })
    })

    describe('assert library LESSERTHAN method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_lesserThan_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertLesserThanTest', contracts.AssertLesserThanTest, compilationData[filename]['AssertLesserThanTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 4 passing test', () => {
        assert.equal(results.passingNum, 4)
      })

      it('should have 4 failing test', () => {
        assert.equal(results.failureNum, 4)
      })

      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertLesserThanTest', filename: __dirname + '/examples_0/assert_lesserThan_test.sol' },
          { type: 'testPass', value: 'Lesser than uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', value: 'Lesser than uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '298:67:0', expected: '2', returned: '4'},
          { type: 'testPass', value: 'Lesser than int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', value: 'Lesser than int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '557:65:0', expected: '-1', returned: '1'},
          { type: 'testPass', value: 'Lesser than uint int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', value: 'Lesser than uint int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '826:71:0', expected: '-1', returned: '115792089237316195423570985008687907853269984665640564039457584007913129639935'},
          { type: 'testPass', value: 'Lesser than int uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', value: 'Lesser than int uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '1105:69:0', expected: '1', returned: '1'},
        ], ['time', 'web3'])
      })
    })

    describe('test with beforeAll', () => {
      const filename: string = __dirname + '/examples_1/simple_storage_test.sol'

      beforeAll((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 3 passing test', () => {
        assert.equal(results.passingNum, 3)
      })

      it('should have 1 failing test', () => {
        assert.equal(results.failureNum, 1)
      })

      it('should return 6 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'MyTest', filename: __dirname + '/examples_1/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', value: 'Initial value should not be200', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testFailure', value: 'Should trigger one fail', filename: __dirname + '/examples_1/simple_storage_test.sol', errMsg: 'uint test 1 fails', context: 'MyTest', assertMethod: 'equal', location: '532:51:1', expected: '2', returned: '1'},
          { type: 'testPass', value: 'Should trigger one pass', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' }
        ], ['time', 'web3'])
      })
    })

    describe('test with beforeEach', () => {
      const filename: string = __dirname + '/examples_2/simple_storage_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 2 passing tests', () => {
        assert.equal(results.passingNum, 2)
      })

      it('should 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })

      it('should return 4 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'MyTest', filename: __dirname + '/examples_2/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', value: 'Value is set200', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' }
        ], ['time', 'web3'])
      })
    })

    // Test string equality
    describe('test string equality', () => {
      const filename: string = __dirname + '/examples_3/simple_string_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('StringTest', contracts.StringTest, compilationData[filename]['StringTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should 2 passing tests', () => {
        assert.equal(results.passingNum, 2)
      })

      it('should return 4 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StringTest', filename: __dirname + '/examples_3/simple_string_test.sol' },
          { type: 'testPass', value: 'Initial value should be hello world', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' },
          { type: 'testPass', value: 'Value should not be hello wordl', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' }
        ], ['time', 'web3'])
      })
    })

    // Test multiple directory import in test contract
    describe('test multiple directory import in test contract', () => {
      const filename: string = __dirname + '/examples_5/test/simple_storage_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('StorageResolveTest', contracts.StorageResolveTest, compilationData[filename]['StorageResolveTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should 3 passing tests', () => {
        assert.equal(results.passingNum, 3)
      })

      it('should return 4 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StorageResolveTest', filename: __dirname + '/examples_5/test/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', value: 'Check if even', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', value: 'Check if odd', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' }
        ], ['time', 'web3'])
      })
    })

    //Test SafeMath library methods
    describe('test SafeMath library', () => {
      const filename: string = __dirname + '/examples_4/SafeMath_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SafeMathTest', contracts.SafeMathTest, compilationData[filename]['SafeMathTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 10 passing tests', () => {
        assert.equal(results.passingNum, 10)
      })
      it('should have 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })
    })

    //Test signed/unsigned integer weight
    describe('test number weight', () => {
      const filename: string = __dirname + '/number/number_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('IntegerTest', contracts.IntegerTest, compilationData[filename]['IntegerTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 6 passing tests', () => {
        assert.equal(results.passingNum, 6)
      })
      it('should have 2 failing tests', () => {
        assert.equal(results.failureNum, 2)
      })
    })

    // Test Transaction with custom sender & value
    describe('various sender', () => {
      const filename: string = __dirname + '/various_sender/sender_and_value_test.sol'

      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SenderAndValueTest', contracts.SenderAndValueTest, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
        })
      })

      afterAll(() => { tests = [] })

      it('should have 17 passing tests', () => {
        assert.equal(results.passingNum, 17)
      })
      it('should have 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })
    })

    // Test `runTest` method without sending contract object (should throw error)
    describe('runTest method without contract json interface', () => {
      const filename: string = __dirname + '/various_sender/sender_and_value_test.sol'
      const errorCallback: Function = (done) => {
        return (err, _results) => {
          if (err && err.message.includes('Contract interface not available')) { 
            results = _results
            done() 
          }
          else throw err
        }
      }
      beforeAll(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: object, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SenderAndValueTest', undefined, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts }, testCallback, errorCallback(done))
        })
      })

      it('should have 0 passing tests', () => {
        assert.equal(results.passingNum, 0)
      })
      it('should have 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })
    })
  })
})
