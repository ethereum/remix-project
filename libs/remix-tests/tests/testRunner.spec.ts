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
        deployAll(compilationResult, web3, accounts, false, null, next)
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
          { type: 'testPass', debugTxHash: '0x5b665752a4faf83229259b9b2811d3295be0af633b0051d4b90042283ef55707', value: 'Ok pass test', filename: __dirname + '/examples_0/assert_ok_test.sol', context: 'AssertOkTest', hhLogs: hhLogs1 },
          { type: 'testFailure', debugTxHash: '0xa0a30ad042a7fc3495f72be7ba788d705888ffbbec7173f60bb27e07721510f2',value: 'Ok fail test', filename: __dirname + '/examples_0/assert_ok_test.sol', errMsg: 'okFailTest fails', context: 'AssertOkTest', hhLogs: hhLogs2, assertMethod: 'ok', location: '370:36:0', expected: 'true', returned: 'false'},
          
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
          { type: 'testPass', debugTxHash: '0xbe77baee10f8a044a68fbb83abf57ce1ca63b8739f3b2dcd122dab0ee44fd0e9', value: 'Equal uint pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0xfc9691b0cd0a49dbefed5cd3fad32158dd229e5bb7b0eb11da3c72054eafae8b', value: 'Equal uint fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalUintFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '273:57:0', expected: '2', returned: '1'},
          { type: 'testPass', debugTxHash: '0xbc142789e5a51841781536a9291c9022896b0c7453140fdc98996638c0d76045', value: 'Equal int pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0xcc28211a4ab3149b1122fb47f45529a4edddbafa076d2338cc3754ab0629eaa1', value: 'Equal int fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalIntFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '493:45:0', expected: '2', returned: '-1'},
          { type: 'testPass', debugTxHash: '0x4f5570fc7da86f09aafb436ff3b4c46aa885f71680a233234433d0ef0346206b', value: 'Equal bool pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x28dc2d146dee77a2d6446efb088e5f9d008a3c7a14116e798401b68470da017f', value: 'Equal bool fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBoolFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '708:52:0', expected: false, returned: true},
          { type: 'testPass', debugTxHash: '0x0abc8fa8831efa3a8c82c758d045c1382f71b6a7f7e9135ffbe9e40059f84617', value: 'Equal address pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x5ec200fb053539b8165a6b6ab36e9229a870c4752b0d6ff2786c4d5a66d5b35d', value: 'Equal address fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalAddressFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1015:130:0', expected: '0x1c6637567229159d1eFD45f95A6675e77727E013', returned: '0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9'},
          { type: 'testPass', debugTxHash: '0xb6c34f5baa6916569d122bcb1210fcd07fb126f4b859fea58db5328e5f1dab85', value: 'Equal bytes32 pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0xb3af74a384b8b6ddacbc03a480ae48e233415b1570717ca7023530023a871be6', value: 'Equal bytes32 fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalBytes32FailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1670:48:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6979000000000000000000000000000000000000000000000000000000'},
          { type: 'testPass', debugTxHash: '0x8537e74941b511b5c745b398e55435748adcdf637659247e0d573fb681ee4833', value: 'Equal string pass test', filename: __dirname + '/examples_0/assert_equal_test.sol', context: 'AssertEqualTest' },
          { type: 'testFailure', debugTxHash: '0x30d44498e63ac51f1412062b849144c103e19a4dc9daf81c5e84bd984ef738a6', value: 'Equal string fail test', filename: __dirname + '/examples_0/assert_equal_test.sol', errMsg: 'equalStringFailTest fails', context: 'AssertEqualTest', assertMethod: 'equal', location: '1916:81:0', expected: 'remix-tests', returned: 'remix'}
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
          { type: 'testPass', debugTxHash: '0xb0ac5cde13a5005dc1b4efbb66fb3a5d6f0697467aedd6165ed1c8ee552939bc', value: 'Not equal uint pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x69d25ed9b9a010e97e0f7282313d4018c77a8873fd5f2e0b12483701febdd6b4', value: 'Not equal uint fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualUintFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '288:63:0', expected: '1', returned: '1'},
          { type: 'testPass', debugTxHash: '0x19a743cfb44b273c78b3271d603412d31087974309a70595bc5d15097a52c5c5', value: 'Not equal int pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x8dfce61b71a9ea65fb00c471370413779626f290b71d41f8be8408674e64f4d2', value: 'Not equal int fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualIntFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '525:52:0', expected: '-2', returned: '-2'},
          { type: 'testPass', debugTxHash: '0x12bc9eb3a653ebe4c7ab954c144dab4848295c88d71d17cb86a41e8a004419ba', value: 'Not equal bool pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x901b9cd631f8f29841243a257d1914060b9c36d88ee7d8b624de76dad4a34c85', value: 'Not equal bool fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBoolFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '760:57:0', expected: true, returned: true},
          { type: 'testPass', debugTxHash: '0xf9e48bac26d3a2871ceb92974b897cae61e60bbc4db115b7e8eff4ac0390e4a5', value: 'Not equal address pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x4e83a17426bc79b147ddd30a5434a2430a8302b3ce78b6979088ac5eceac5d3c', value: 'Not equal address fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualAddressFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1084:136:0', expected: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, returned: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9},
          { type: 'testPass', debugTxHash: '0xfb4b30bb8373eeb6b09e38ad07880b86654f72780b41d7cf7554a112a04a0f53', value: 'Not equal bytes32 pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x43edf8bc68229415ee63f63f5303351a0dfecf9f3eb2ec35ffd2c10c60cf7005', value: 'Not equal bytes32 fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBytes32FailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1756:54:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6978000000000000000000000000000000000000000000000000000000'},
          { type: 'testPass', debugTxHash: '0x712932edc040596e2b02ddc06a48b773f5fccc7346d55cefc5d1c52528ce3168', value: 'Not equal string pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
          { type: 'testFailure', debugTxHash: '0x961ce7425fdd4049aeb678ea20a0441eb837c1fe26b0d010593fc07d668321e6', value: 'Not equal string fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualStringFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '2026:81:0', expected: 'remix', returned: 'remix'},
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
          { type: 'testPass', debugTxHash: '0x81cf46560b522280ac60bd5c8efedad4598957d33435a898c23eefb13ca6104f', value: 'Greater than uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0x7090dc27ac06e1afd66963992bdd9188200d0404d43b95cfa5d925bbe6eba3ed', value: 'Greater than uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '303:69:0', expected: '4', returned: '1'},
          { type: 'testPass', debugTxHash: '0xd57b40ed464763baf128f8a72efcd198e825e0b8f498cef90aed23045d0196db', value: 'Greater than int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0x6c7b84bd8fc452b7839e11129d3818fa69dfd9b914e55556b39fdc68b70fc1b5', value: 'Greater than int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '569:67:0', expected: '1', returned: '-1'},
          { type: 'testPass', debugTxHash: '0xc5883db70b83a1d3afff24a9f0555de3edd7776e5ec157cc2110e426e5be2594', value: 'Greater than uint int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0xa534085a6bbdcf73a68bdef6a1421218c11ac0ec1af398f9445defeea31cea6e', value: 'Greater than uint int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '845:71:0', expected: '2', returned: '1'},
          { type: 'testPass', debugTxHash: '0x36a7139445d76f6072fab4cc0717461068276748622c0dfc3f092d548b197de8', value: 'Greater than int uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
          { type: 'testFailure', debugTxHash: '0x7890f7b8f2eabae581b6f70d55d2d3bfa64ddd7753d5f892dbdf86ced96945fe', value: 'Greater than int uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '1125:76:0', expected: '115792089237316195423570985008687907853269984665640564039457584007913129639836', returned: '100'}
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
          { type: 'testPass', debugTxHash: '0x47875047c1fff8a7b1cc1603418960cd2a3afe8a9c59337b19fb463a85d6e47e', value: 'Lesser than uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0xf6fd459d0b28d0d85c56dd69d953331291e1c234c8a263150252e35da0ed6671', value: 'Lesser than uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '298:67:0', expected: '2', returned: '4'},
          { type: 'testPass', debugTxHash: '0x761d95111764af396634474899ff1db218d5e514d6de6bc3260af15b1f5b929f', value: 'Lesser than int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0xc17697ef2df92c22707639caa9355bdf0d98dbb18157e72b8b257bb0eb2beb4e', value: 'Lesser than int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '557:65:0', expected: '-1', returned: '1'},
          { type: 'testPass', debugTxHash: '0xf0721b28c547c1c64948661d677cf6afc10d139315726280162a984f2f7e5d9c', value: 'Lesser than uint int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0x0757289229b58043c101cb311df8db16d1b30944747493e1491daa9aca6aa30e', value: 'Lesser than uint int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '826:71:0', expected: '-1', returned: '115792089237316195423570985008687907853269984665640564039457584007913129639935'},
          { type: 'testPass', debugTxHash: '0x316feb8f80c04b12194262dd80b6b004232eab00d7f7c3846badf6e92684e177', value: 'Lesser than int uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
          { type: 'testFailure', debugTxHash: '0x65c5ab3cb85f163eefe3321cc4444defa99154d3cbe415b9384bbd2627449b6a', value: 'Lesser than int uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '1105:69:0', expected: '1', returned: '1'},
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
          { type: 'testPass', debugTxHash: '0x5a805403a12f0431c5dd190d31a87eb62758f09dddc0c6ee7ee6899c5e7eba71', value: 'Initial value should be100', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', debugTxHash: '0xd0ae7cb5a3a0f5e8f7bf90129e3daba36f649a5c1176ad54609f7b7615bef7dd', value: 'Initial value should not be200', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testFailure', debugTxHash: '0xb0d613434f2fd7060f97d4ca8bbfd8f2deeebed83062a25044f0237bd38b3229', value: 'Should trigger one fail', filename: __dirname + '/examples_1/simple_storage_test.sol', errMsg: 'uint test 1 fails', context: 'MyTest', assertMethod: 'equal', location: '532:51:1', expected: '2', returned: '1'},
          { type: 'testPass', debugTxHash: '0x5ee675ec81b550386b2fdd359ae3530e49dd3e02145e877a4a5f68753ac4e341', value: 'Should trigger one pass', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' }
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
          { type: 'testPass', debugTxHash: '0xa700d29204f1ddb40ef66f151c44387f905d405b6da10380111a751451af2fe1', value: 'Initial value should be100', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' },
          { type: 'testPass', debugTxHash: '0x2c037b78a435e5964615f838ea65f077f3b15d8552d514b3551d0fb87419e444', value: 'Value is set200', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' }
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
          { type: 'testPass', debugTxHash: '0x4e160dbc81f88d3d87b39d81651c42b0ea8e3aaa10c1a57394467e073bbcb2a4', value: 'Initial value should be hello world', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' },
          { type: 'testPass', debugTxHash: '0x47030578c5bcb990d837356430697d061a02813e3322fa3323f6b5f78176eea6', value: 'Value should not be hello wordl', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' }
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
          { type: 'testPass', debugTxHash: '0x85e901e9160c4a17725d020f030c7cbb020d36da1fda8422d990391df3cbfcbb', value: 'Initial value should be100', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', debugTxHash: '0x1abb2456746b416cddcaf2f3fe960103e740e9772c47a0f1d65d48394facb21a', value: 'Check if even', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
          { type: 'testPass', debugTxHash: '0xfcc2332a24d2780390e85a06343fab81c4dc20c12cf5455d746641a9c3e8db03', value: 'Check if odd', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' }
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
