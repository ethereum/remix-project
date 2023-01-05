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
            web3.eth.getAccounts((_err: Error | null | undefined, _accounts: string[]) => {
                accounts = _accounts
                web3.eth.defaultAccount = accounts[0]
                next(_err)
            })
        },
        function compile(next: any): void {
            compileFileOrFiles(filename, false, { accounts }, null, next)
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

                ], ['time', 'web3'])
            })
        })

        describe('assert library EQUAL method tests', function () {
            const filename: string = __dirname + '/examples_0/assert_equal_test.sol'

            before((done) => {
                compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
                    runTest('AssertEqualTest', contracts.AssertEqualTest, compilationData[filename]['AssertEqualTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    runTest('AssertNotEqualTest', contracts.AssertNotEqualTest, compilationData[filename]['AssertNotEqualTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0xdef34ec7fbc6a3e6c6ef619b424bf8ebf16db16ed3f74500d56d8170d3aeca66', value: 'Not equal uint pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    { type: 'testFailure', debugTxHash: '0xfcbd35bc5f460e22e885951d560171d687cf90ccdffc41fb5de1beb7075fe4e9', value: 'Not equal uint fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualUintFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '288:63:0', expected: '1', returned: '1' },
                    { type: 'testPass', debugTxHash: '0x7f269855c3fc5c677eca416eb85665b8f10df00d3b7ec5dcc00cbf8e6364cba4', value: 'Not equal int pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    { type: 'testFailure', debugTxHash: '0x76555e218571d4ad69496d7d10ae46d30149c4bfd8c6e15ff2a58668ab6fba62', value: 'Not equal int fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualIntFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '525:52:0', expected: '-2', returned: '-2' },
                    { type: 'testPass', debugTxHash: '0x5fe790b3f32b9580c1d5f9a2dbb0e10ddcb62846037d3f5800d47a51bb67cc91', value: 'Not equal bool pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    { type: 'testFailure', debugTxHash: '0x660d0a73395e6855aea8f6d3450e63640437dc15071842b417c39f40e1d7ae61', value: 'Not equal bool fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBoolFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '760:57:0', expected: true, returned: true },
                    { type: 'testPass', debugTxHash: '0x6fddce5573bd6723acf5a3e4137d698ff78f695873a228939276c4323ddfb132', value: 'Not equal address pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    { type: 'testFailure', debugTxHash: '0x51479e46db802fb598c61ca0dd630345b9d70cc58667b5a80aa79e8119fa7787', value: 'Not equal address fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualAddressFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1084:136:0', expected: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, returned: 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9 },
                    { type: 'testPass', debugTxHash: '0xbcaf6d8977b655fdedb280e0e9221d728706d41e85e0973d00c8da1d128022c7', value: 'Not equal bytes32 pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    { type: 'testFailure', debugTxHash: '0x34008ef0ea908fedbf80471424d801f5069e6e46221f8ee4a2ee16776a6eeef6', value: 'Not equal bytes32 fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualBytes32FailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '1756:54:0', expected: '0x72656d6978000000000000000000000000000000000000000000000000000000', returned: '0x72656d6978000000000000000000000000000000000000000000000000000000' },
                    { type: 'testPass', debugTxHash: '0x8e0bc9dedea6e088ca7bd82b1e9fab516be5a52f7716a26ccca8197236aae105', value: 'Not equal string pass test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', context: 'AssertNotEqualTest' },
                    { type: 'testFailure', debugTxHash: '0x13c6d270c3609ef858dd6d0c79433ca0b43e47b485b2e40ffe363f18f2868ea8', value: 'Not equal string fail test', filename: __dirname + '/examples_0/assert_notEqual_test.sol', errMsg: 'notEqualStringFailTest fails', context: 'AssertNotEqualTest', assertMethod: 'notEqual', location: '2026:81:0', expected: 'remix', returned: 'remix' },
                ], ['time', 'web3'])
            })
        })

        describe('assert library GREATERTHAN method tests', function () {
            const filename: string = __dirname + '/examples_0/assert_greaterThan_test.sol'

            before((done) => {
                compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
                    runTest('AssertGreaterThanTest', contracts.AssertGreaterThanTest, compilationData[filename]['AssertGreaterThanTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0xdc325916fd93227b76231131e52e67f8913d395098c5ac767032db9bd757a91c', value: 'Greater than uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
                    { type: 'testFailure', debugTxHash: '0xf98eea22bb86f13e0bb4072df22b540289a46b332bdb203a1e488d7e14a1dcd4', value: 'Greater than uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '303:69:0', expected: '4', returned: '1' },
                    { type: 'testPass', debugTxHash: '0xef5ef38329ba6aac2f868d53d803053c52b1895a2c25b704260435c141a63bfc', value: 'Greater than int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
                    { type: 'testFailure', debugTxHash: '0x6b9430f3f12c12fb11e5a8d32fef849ab34614e644be20c6b41a25e510453440', value: 'Greater than int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '569:67:0', expected: '1', returned: '-1' },
                    { type: 'testPass', debugTxHash: '0x4c6e10815a5e82bf2c60950606dc886317f680028a9229ba2dda17b5ea36325a', value: 'Greater than uint int pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
                    { type: 'testFailure', debugTxHash: '0x989c405c32c8e270a5dea69e6250a514c05dacd6fcf018365a241abc28c2497b', value: 'Greater than uint int fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanUintIntFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '845:71:0', expected: '2', returned: '1' },
                    { type: 'testPass', debugTxHash: '0x9fed670ae2061929f71780835b7ea3eb7da6d4fb553cd2d5f62950c353165861', value: 'Greater than int uint pass test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', context: 'AssertGreaterThanTest' },
                    { type: 'testFailure', debugTxHash: '0xcf394fd279293cdcf58efc42f3a443595fdb171769a45df01b0c84cd76b3a9a2', value: 'Greater than int uint fail test', filename: __dirname + '/examples_0/assert_greaterThan_test.sol', errMsg: 'greaterThanIntUintFailTest fails', context: 'AssertGreaterThanTest', assertMethod: 'greaterThan', location: '1125:76:0', expected: '115792089237316195423570985008687907853269984665640564039457584007913129639836', returned: '100' }
                ], ['time', 'web3'])
            })
        })

        describe('assert library LESSERTHAN method tests', function () {
            const filename: string = __dirname + '/examples_0/assert_lesserThan_test.sol'

            before((done) => {
                compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
                    runTest('AssertLesserThanTest', contracts.AssertLesserThanTest, compilationData[filename]['AssertLesserThanTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0x524fb46aa0e8a78bc11a99432908d422450c2933d837f858aeacba9b84706d5c', value: 'Lesser than uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
                    { type: 'testFailure', debugTxHash: '0x0551a67b10b9e13182e8bdb4e530ed92466d5054ae959f999f2c558da2c39d22', value: 'Lesser than uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '298:67:0', expected: '2', returned: '4' },
                    { type: 'testPass', debugTxHash: '0x6d63958d8c3230e837d0ca8335e57262c6e0c6b2c07a5b481842b9ad7329ac28', value: 'Lesser than int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
                    { type: 'testFailure', debugTxHash: '0x38e96ef44f4e785db4d40a95862a9797e8cef6de0ce1d059da72ff42e2f3ca62', value: 'Lesser than int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '557:65:0', expected: '-1', returned: '1' },
                    { type: 'testPass', debugTxHash: '0x699f9fc2bf7a14134e89b94cd9dc1c537b5d4581a1c26a34a0c3343ddede9608', value: 'Lesser than uint int pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
                    { type: 'testFailure', debugTxHash: '0xce1391dcfbfdc6c611e357e6c1c9f6cd9f257153ee400cb80bd36af6d239c342', value: 'Lesser than uint int fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanUintIntFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '826:71:0', expected: '-1', returned: '115792089237316195423570985008687907853269984665640564039457584007913129639935' },
                    { type: 'testPass', debugTxHash: '0x7040e6664c13e6b35ef1daaef93a8cae36a62150d818183892096a98b921800c', value: 'Lesser than int uint pass test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', context: 'AssertLesserThanTest' },
                    { type: 'testFailure', debugTxHash: '0x8c58bb433ea41760dcf11114232407d703e8ebf7d5e9637e2923282eae5caee6', value: 'Lesser than int uint fail test', filename: __dirname + '/examples_0/assert_lesserThan_test.sol', errMsg: 'lesserThanIntUintFailTest fails', context: 'AssertLesserThanTest', assertMethod: 'lesserThan', location: '1105:69:0', expected: '1', returned: '1' },
                ], ['time', 'web3'])
            })
        })

        describe('test with before', function () {
            const filename: string = __dirname + '/examples_1/simple_storage_test.sol'

            before((done) => {
                compileAndDeploy(filename, (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) => {
                    runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0xed5b6898331119c6e3d1185b9de65d87ad7329cc629a8f2d43b966cf180a5dc1', value: 'Initial value should be100', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
                    { type: 'testPass', debugTxHash: '0x79cae5c4f44edfd7ae3490e01c75df5741b107672cef5e69800e4d30d380a721', value: 'Initial value should not be200', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' },
                    { type: 'testFailure', debugTxHash: '0x24a20f7643e88f891e469ef495911ab0b75f99e2b09b9b091e688674910d1506', value: 'Should trigger one fail', filename: __dirname + '/examples_1/simple_storage_test.sol', errMsg: 'uint test 1 fails', context: 'MyTest', assertMethod: 'equal', location: '532:51:1', expected: '2', returned: '1' },
                    { type: 'testPass', debugTxHash: '0x08b1f60c908b7e6cf2dd24fc166c755f0fe5336aebfb325cae4ce00ea9bbf932', value: 'Should trigger one pass', filename: __dirname + '/examples_1/simple_storage_test.sol', context: 'MyTest' }
                ], ['time', 'web3'])
            })
        })

        describe('test with beforeEach', function () {
            const filename: string = __dirname + '/examples_2/simple_storage_test.sol'

            before(done => {
                compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
                    runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0xed5b6898331119c6e3d1185b9de65d87ad7329cc629a8f2d43b966cf180a5dc1', value: 'Initial value should be100', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' },
                    { type: 'testPass', debugTxHash: '0x8ed5b4858405b43ad4052f5690b4b711c0f6cdeb67a64f54084417d43bc54308', value: 'Value is set200', filename: __dirname + '/examples_2/simple_storage_test.sol', context: 'MyTest' }
                ], ['time', 'web3'])
            })
        })

        // Test string equality
        describe('test string equality', function () {
            const filename: string = __dirname + '/examples_3/simple_string_test.sol'

            before(done => {
                compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
                    runTest('StringTest', contracts.StringTest, compilationData[filename]['StringTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0x3567da76ffbec37e3b43a41987a7ff3e61b41b4c544f35c010d2d4b39568d6d4', value: 'Initial value should be hello world', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' },
                    { type: 'testPass', debugTxHash: '0x8619b743ccc99be7d5347a064732474b2d1b69844be65b0e7754c6ac1340d275', value: 'Value should not be hello wordl', filename: __dirname + '/examples_3/simple_string_test.sol', context: 'StringTest' }
                ], ['time', 'web3'])
            })
        })

        // Test multiple directory import in test contract
        describe('test multiple directory import in test contract', function () {
            const filename: string = __dirname + '/examples_5/test/simple_storage_test.sol'

            before(done => {
                compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
                    runTest('StorageResolveTest', contracts.StorageResolveTest, compilationData[filename]['StorageResolveTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    { type: 'testPass', debugTxHash: '0xed5b6898331119c6e3d1185b9de65d87ad7329cc629a8f2d43b966cf180a5dc1', value: 'Initial value should be100', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
                    { type: 'testPass', debugTxHash: '0x6893fe4f5a83cc51f03c9237ab93b93ffd826236167d58e20666be4c1b3128a4', value: 'Check if even', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' },
                    { type: 'testPass', debugTxHash: '0x64e600b32be681b68926660042ddd96f22d07949b424959811b8acb56e72f719', value: 'Check if odd', filename: __dirname + '/examples_5/test/simple_storage_test.sol', context: 'StorageResolveTest' }
                ], ['time', 'web3'])
            })
        })

        //Test SafeMath library methods
        describe('test SafeMath library', function () {
            const filename: string = __dirname + '/examples_4/SafeMath_test.sol'

            before(done => {
                compileAndDeploy(filename, function (_err: Error | null | undefined, compilationData: any, contracts: any, asts: any, accounts: string[], web3: any) {
                    runTest('SafeMathTest', contracts.SafeMathTest, compilationData[filename]['SafeMathTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    runTest('IntegerTest', contracts.IntegerTest, compilationData[filename]['IntegerTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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
                    runTest('SenderAndValueTest', contracts.SenderAndValueTest, compilationData[filename]['SenderAndValueTest'], asts[filename], { accounts }, testCallback, resultsCallback(done))
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