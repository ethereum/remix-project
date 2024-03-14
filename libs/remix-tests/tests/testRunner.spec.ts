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
// Assertions for the existence of these will be made at the correct places.
function deepEqualExcluding(a: any, b: any, excludedKeys: string[]) {
  function removeKeysFromObject(obj: any, excludedKeys: string[]) {
    if (obj !== Object(obj)) {
      return obj
    }

    if (Object.prototype.toString.call(obj) !== '[object Array]') {
      obj = Object.assign({}, obj)
      for (const key of excludedKeys) {
        delete obj[key]
      }

      return obj
    }

    const newObj = []
    for (const idx in obj) {
      newObj[idx] = removeKeysFromObject(obj[idx], excludedKeys);
    }

    return newObj
  }

  const aStripped: any = removeKeysFromObject(a, excludedKeys);
  const bStripped: any = removeKeysFromObject(b, excludedKeys);
  assert.deepEqual(aStripped, bStripped)
}

let accounts: string[]
const provider: any = new Provider()

async function compileAndDeploy(filename: string, callback: any) {
  const web3: Web3 = new Web3()
  const sourceASTs: any = {}
  await provider.init()
  web3.setProvider(provider)
  extend(web3)
  let compilationData: any
  async.waterfall([
    function getAccountList(next: any): void {
      web3.eth.getAccounts()
        .then(( _accounts: string[]) => {
          accounts = _accounts
          web3.eth.defaultAccount = accounts[0]
          next(undefined)
        })
        .catch((_err: Error | null | undefined) => next(_err))
    },
    function compile(next: any): void {
      compileFileOrFiles(filename, false, { accounts, web3 }, null, next)
    },
    function deployAllContracts(compilationResult: compilationInterface, asts, next: any): void {
      for (const filename in asts) {
        if (filename.endsWith('_test.sol'))
          sourceASTs[filename] = asts[filename].ast
      }
      // eslint-disable-next-line no-useless-catch
      try {
        compilationData = compilationResult
        deployAll(compilationResult, web3, accounts, false, null, next)
      } catch (e) {
        throw e
      }
    }
  ], function (_err: Error | null | undefined, contracts: any): void {
    callback(null, compilationData, contracts, sourceASTs, accounts, web3)
  })
}

describe('testRunner', function () {
  let tests: any[] = [], results: ResultsInterface;

  const testCallback: TestCbInterface = (err, test) => {
    if (err) { throw err }

    if (test.type === 'testPass' || test.type === 'testFailure') {
      assert.ok(test.time, 'test time not reported')
      assert.ok(!Number.isInteger(test.time || 0), 'test time should not be an integer')
    }

    tests.push(test)
  }

  const resultsCallback = (done) => {
    return (err, _results) => {
      if (err) { throw err }
      results = _results
      done()
    }
  }

  describe('#runTest', function () {
    this.timeout(10000)
    describe('assert library OK method tests', () => {
      const filename: string = __dirname + '/examples_0/assert_ok_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertOkTest', contracts.AssertOkTest, compilationData[filename]['AssertOkTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 1 passing test', () => {
        assert.equal(results.passingNum, 1)
      })

      it('should have 1 failing test', () => {
        assert.equal(results.failureNum, 1)
      })

      const hhLogs1 = [["AssertOkTest", "okPassTest"]]
      const hhLogs2 = [["AssertOkTest", "okFailTest"]]
      it('should return', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'AssertOkTest', filename: __dirname + '/examples_0/assert_ok_test.sol' },
          { type: 'testPass', debugTxHash: '0x5b665752a4faf83229259b9b2811d3295be0af633b0051d4b90042283ef55707', value: 'Ok pass test', filename: __dirname + '/examples_0/assert_ok_test.sol', context: 'AssertOkTest', hhLogs: hhLogs1 },
          { type: 'testFailure', debugTxHash: '0xa0a30ad042a7fc3495f72be7ba788d705888ffbbec7173f60bb27e07721510f2', value: 'Ok fail test', filename: __dirname + '/examples_0/assert_ok_test.sol', errMsg: 'okFailTest fails', context: 'AssertOkTest', hhLogs: hhLogs2, assertMethod: 'ok', location: '366:36:0', expected: 'true', returned: 'false' },
        //
        ], ['time','type','debugTxHash','location','expected','returned','errMsg','assertMethod','web3'])
      })
    })

    describe('assert library EQUAL method tests', function () {
      const filename: string = __dirname + '/examples_0/assert_equal_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertEqualTest', contracts.AssertEqualTest, compilationData[filename]['AssertEqualTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0x233b8d91f0fa068b1a4deae1141178bc3eb79c3d2a6786160595a358363a157c', value: 'Equal uint pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0xa5e39c78663c2e5071c08467047ba5b2650d16081b50369700d46d7f90c4d94b', value: 'Equal uint fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalUintFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '273:57:0', expected: '2', returned: '1' },
          { type: 'testPass', debugTxHash: '0x57af51c2c19db390a4ccf72fa3d32347fb3d998e70820909c7876bd8ccebf8a3', value: 'Equal int pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x710f3a54a561c009fcf0277273b8fe337b2c493e9e83e0ae02786d487339ca7b', value: 'Equal int fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalIntFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '493:45:0', expected: '2', returned: '-1' },
          { type: 'testPass', debugTxHash: '0x10c1ed8651110ad5de6adcad8e1284aa5c1fd3a998a1e863bbecc0ec855fcd7b', value: 'Equal bool pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x004871a82968f43e02278eab9dd3d7eb0bbe88b64d459efa50065e5996fe5fad', value: 'Equal bool fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBoolFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '708:52:0', expected: false, returned: true },
          { type: 'testPass', debugTxHash: '0x64a4d4853ab7907712912cf2120ac2bfd2e08b4767b375250f0e907757546454', value: 'Equal address pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0xcf62fb76e3b2eb95d92aa2671a9e81e30fefb944f55e2fb8b97096c45fc74a38', value: 'Equal address fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalAddressFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1015:130:0', expected: '0x1c6637567229159d1eFD45f95A6675e77727E013', returned: '0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9' },
          { type: 'testPass', debugTxHash: '0x18ef613acc128a21282e09cf920b32ef3be648bb35c0299471ddbbbeeb0faf8c', value: 'Equal bytes32 pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x86fbf2f14e13d228f80a87a947841270d8c55073adddf78e8d4e2ba05d724ec6', value: 'Equal bytes32 fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBytes32FailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1670:48:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6979000000000000000000000000000000000000000000000000000000' },
          { type: 'testPass', debugTxHash: '0x80b3465f2504b74359790baa009237ba066685b24afa65a31814f1ad1bc4f99f', value: 'Equal string pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x88b035a85c5f87f54a805334817f3e4599b4190d98f25947fe14d7804facd8b7', value: 'Equal string fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalStringFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1916:81:0', expected: 'remix-tests', returned: 'remix' }
        ], ['time', 'web3'])
      })
    })



    describe('assert library NOTEQUAL method tests', function () {
      const filename: string = __dirname + '/examples_0/assert_notEqual_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertNotEqualTest', contracts.AssertNotEqualTest, compilationData[filename]['AssertNotEqualTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0xebc513bd2625be3b228840ebb8f5a9ea53e4f32870f015c97d1b6f91b916b367', value: 'Not equal uint pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x2cb59a137f2d3a76eee28bce662cb8618ad9cb9068f6be51935bf24911f90b43', value: 'Not equal uint fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualUintFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '288:63:0', expected: '1', returned: '1' },
          { type: 'testPass', debugTxHash: '0xc66c3c63a74463e5ce77311393d143b014ea510fb49992a7a828a78f00f9ca51', value: 'Not equal int pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x1606fcdf8583d0e629125bcadf2f115334228fac79cbbb5d756fafd9ca6b8f06', value: 'Not equal int fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualIntFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '525:52:0', expected: '-2', returned: '-2' },
          { type: 'testPass', debugTxHash: '0x8cce267a27b4b7aedb9f50499017b971d4058cd11c7f61a267b9ff159126af6d', value: 'Not equal bool pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x2e08b9742bf3d99f08c5563600ab228a54c3b9e432a40912ab6d4a5f3779a671', value: 'Not equal bool fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBoolFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '760:57:0', expected: true, returned: true },
          { type: 'testPass', debugTxHash: '0x03cb41ad90b032bb94a994e62828bf03f8042c8b41f51c46f68171a3b4ab36a3', value: 'Not equal address pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          { type: 'testFailure', debugTxHash: '0xa68c8214a422e42335ba50407f5bc096332c289a9fede3d264ef27e02e6565af', value: 'Not equal address fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualAddressFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1084:136:0', expected: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, returned: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9 },
          { type: 'testPass', debugTxHash: '0xb83a9e2dd2bc916b40a87f038b0c96b3be6b2796d65900bbdf1467027d0b4f96', value: 'Not equal bytes32 pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x3a8e50586fee6fe4e5d765d1392151e550b28959ea8eb823e8fdf54627fa861e', value: 'Not equal bytes32 fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBytes32FailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1756:54:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6978000000000000000000000000000000000000000000000000000000' },
          { type: 'testPass', debugTxHash: '0x8b84801330bbd44f358aee9089263ad7400ffc738f2f1f9e6b06cf6af20816d1', value: 'Not equal string pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0xb2e1b7cdfdc622e1c39e436054168861ca68bb51147940bff6ebd075f8afd2da', value: 'Not equal string fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualStringFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '2026:81:0', expected: 'remix', returned: 'remix' },
        ], ['time', 'web3'])
      })
    })

    describe('assert library GREATERTHAN method tests', function () {
      const filename: string = __dirname + '/examples_0/assert_greaterThan_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertGreaterThanTest', contracts.AssertGreaterThanTest, compilationData[filename]['AssertGreaterThanTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0x563a5b040bd6403de8543a8c44f1b11bb99dbece557f428b966fb70d389e602b', value: 'Greater than uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0x14ec758d313b505d92b0505e0ce940df318bc0136ea6ab9b40bba1a94baeaca5', value: 'Greater than uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '303:69:0', expected: '4', returned: '1' },
          { type: 'testPass', debugTxHash: '0x2de3f6fdf2c93f50289dd5fe469a13e03c22961ddcf110e5f3819a7af39e3e25', value: 'Greater than int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0xa8b897e011895858be4bc37f20e1e17a490b964d0683df5b430ac648e992bd57', value: 'Greater than int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '569:67:0', expected: '1', returned: '-1' },
          { type: 'testPass', debugTxHash: '0xf52652ef6020ae091022455df8713d20cb00a35de8bf485e177128a457a50d6c', value: 'Greater than uint int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0x9f826060a0e5a8c0187d5e9ffe83a153080379a1e1fea0b267745eb8bd52fd6f', value: 'Greater than uint int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '845:71:0', expected: '2', returned: '1' },
          { type: 'testPass', debugTxHash: '0x04e1703c75cc4beb4b8c9ddfb79489192423fe745089382cadb1811cbf2d915c', value: 'Greater than int uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0xbb5c94a5fc46417a4d3c763994da78d4f27c83dbc5545cb0522a39c3c6017432', value: 'Greater than int uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '1125:76:0', expected: '115792089237316195423570985008687907853269984665640564039457584007913129639836', returned: '100' }
        ], ['time', 'web3'])
      })
    })

    describe('assert library LESSERTHAN method tests', function () {
      const filename: string = __dirname + '/examples_0/assert_lesserThan_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('AssertLesserThanTest', contracts.AssertLesserThanTest, compilationData[filename]['AssertLesserThanTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0x407c27582c0b6b2275d03372907c2efcafa1c9e8a1e6ea8d4e20f88e3222b6c7', value: 'Lesser than uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0x6e7fc07decdb5deb71b1177fc7b151bce5b8e42fc6137e1418b4e7277960d972', value: 'Lesser than uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '298:67:0', expected: '2', returned: '4' },
          { type: 'testPass', debugTxHash: '0x353c9bcf4b61abaf4b6ffaae02f18ea0a7fb38a8c3c7a915939561cdf97f2d72', value: 'Lesser than int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0xccab30c5a154c4c2e8ca9a8966b86a55f08188d606c3519a5c29534b4b64fb47', value: 'Lesser than int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '557:65:0', expected: '-1', returned: '1' },
          { type: 'testPass', debugTxHash: '0x8e90fb7f3b8343d037444275cd69d431f75a7fc6b46322c69397373463cee22a', value: 'Lesser than uint int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0x5db60fe115958b767f0defe81eeb6322ee18ec8df690abad0d1581175882136b', value: 'Lesser than uint int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '826:71:0', expected: '-1', returned: '115792089237316195423570985008687907853269984665640564039457584007913129639935' },
          { type: 'testPass', debugTxHash: '0x19f79e8c8ec360cd27beee6399e6853a4fe335af78364ed35c93f8fe39e3100c', value: 'Lesser than int uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0x520ecba457bf71f42d24f61432d872121da699af0374090e2e9098a6719cb0ce', value: 'Lesser than int uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '1105:69:0', expected: '1', returned: '1' },
        ], ['time', 'web3'])
      })
    })

    describe('test with before', function () {
      const filename: string = __dirname + '/examples_1/simple_storage_test.sol'

      before((done) => {
        compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0xd86dbe1efaf707981475a9a4762826c6852cce3e5b0e987827027602d6d6d734', value: 'Initial value should be100', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', debugTxHash: '0x1b5cce7f93b78f8c97ba915e24648127b7f28e86008668d20a4c20fd0fde40bc', value: 'Initial value should not be200', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testFailure', debugTxHash: '0x21472600af5de67cd53a489f2435169fdfbe83d7b7dd43c8a0150725fd91e254', value: 'Should trigger one fail', filename: __dirname + '/examples_1/simple_storage_test.sol', errMsg: 'uint test 1 fails', context: 'MyTest', assertMethod: 'equal', location: '532:51:1', expected: '2', returned: '1' },
          { type: 'testPass', debugTxHash: '0x08b1f60c908b7e6cf2dd24fc166c755f0fe5336aebfb325cae4ce00ea9bbf932', value: 'Should trigger one pass', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' }
        ], ['time', 'web3'])
      })
    })

    describe('test with beforeEach', function () {
      const filename: string = __dirname + '/examples_2/simple_storage_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

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
          { type: 'testPass', debugTxHash: '0xd86dbe1efaf707981475a9a4762826c6852cce3e5b0e987827027602d6d6d734', value: 'Initial value should be100', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', debugTxHash: '0xa447f168cd1ce406635ea2368b61828b107473905e270957b7ee38b94a12e055', value: 'Value is set200', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' }
        ], ['time', 'web3'])
      })
    })

    // Test string equality
    describe('test string equality', function () {
      const filename: string = __dirname + '/examples_3/simple_string_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('StringTest', contracts.StringTest, compilationData[filename]['StringTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should 2 passing tests', () => {
        assert.equal(results.passingNum, 2)
      })

      it('should return 4 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StringTest', filename: __dirname + '/examples_3/simple_string_test.sol' },
          { type: 'testPass', debugTxHash: '0x0f988e614ae6e9a5f560734e8b63f835de14460a5b797e16fa5c68091452d2c5', value: 'Initial value should be hello world', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' },
          { type: 'testPass', debugTxHash: '0x713ec0ad3cd02ffcd64f54e45b4da5498983d18b5a696ea34e9fb5d01928cb3f', value: 'Value should not be hello wordl', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' }
        ], ['time', 'web3'])
      })
    })

    // Test multiple directory import in test contract
    describe('test multiple directory import in test contract', function () {
      const filename: string = __dirname + '/examples_5/test/simple_storage_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('StorageResolveTest', contracts.StorageResolveTest, compilationData[filename]['StorageResolveTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should 3 passing tests', () => {
        assert.equal(results.passingNum, 3)
      })

      it('should return 4 messages', () => {
        deepEqualExcluding(tests, [
          { type: 'accountList', value: accounts },
          { type: 'contract', value: 'StorageResolveTest', filename: __dirname + '/examples_5/test/simple_storage_test.sol' },
          { type: 'testPass', debugTxHash: '0xd86dbe1efaf707981475a9a4762826c6852cce3e5b0e987827027602d6d6d734', value: 'Initial value should be100', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', debugTxHash: '0xc9e1523f6f094cdd909b3977d1eef7c83284b15c22b17b9b0a4a632bf59881f6', value: 'Check if even', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', debugTxHash: '0xe3f415f2cade92243fd795b9988fc9e9c4318983933c0a0b103e968f31c40f55', value: 'Check if odd', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' }
        ], ['time', 'web3'])
      })
    })

    //Test SafeMath library methods
    describe('test SafeMath library', function () {
      const filename: string = __dirname + '/examples_4/SafeMath_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SafeMathTest', contracts.SafeMathTest, compilationData[filename]['SafeMathTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 10 passing tests', () => {
        assert.equal(results.passingNum, 10)
      })
      it('should have 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })
    })

    //Test signed/unsigned integer weight
    describe('test number weight', function () {
      const filename: string = __dirname + '/number/number_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('IntegerTest', contracts.IntegerTest, compilationData[filename]['IntegerTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 6 passing tests', () => {
        assert.equal(results.passingNum, 6)
      })
      it('should have 2 failing tests', () => {
        assert.equal(results.failureNum, 2)
      })
    })

    // Test Transaction with custom sender & value
    describe('various sender', function () {
      const filename: string = __dirname + '/various_sender/sender_and_value_test.sol'

      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SenderAndValueTest', contracts.SenderAndValueTest, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts, web3 }, testCallback, resultsCallback(done))
        })
      })

      after(() => { tests = [] })

      it('should have 17 passing tests', () => {
        assert.equal(results.passingNum, 17)
      })
      it('should have 0 failing tests', () => {
        assert.equal(results.failureNum, 0)
      })
    })

    // Test `runTest` method without sending contract object (should throw error)
    describe('runTest method without contract json interface', function () {
      const filename: string = __dirname + '/various_sender/sender_and_value_test.sol'
      const errorCallback: any = (done) => {
        return (err, _results) => {
          if (err && err.message.includes('Contract interface not available')) {
            results = _results
            done()
          }
          else throw err
        }
      }
      before(done => {
        compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
          runTest('SenderAndValueTest', undefined, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts, web3 }, testCallback, errorCallback(done))
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
