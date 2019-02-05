import * as async from 'async'
import Web3 from 'web3'
import * as assert from 'assert'
import { Provider } from 'remix-simulator'

let Compiler = require('../src/compiler.js')
let Deployer = require('../src/deployer.js')
import runTest from '../dist/testRunner.js'

interface Results {
    passingNum: number,
    failureNum: number,
}

function compileAndDeploy (filename: string, callback: Function) {
    let web3: Web3 = new Web3()
    web3.setProvider(new Provider())
    let compilationData: object
    let accounts: object
    async.waterfall([
      function getAccountList(next: Function): void {
        web3.eth.getAccounts((_err: Error, _accounts: object) => {
          accounts = _accounts
          next(_err)
        })
      },
      function compile(next: Function) {
        Compiler.compileFileOrFiles(filename, false, {accounts}, next)
      },
      function deployAllContracts(compilationResult: object, next: Function): void {
        try {
          compilationData = compilationResult
          Deployer.deployAll(compilationResult, web3, next)
        } catch(e) {
          throw e
        }
      }
    ], function(_err: Error | null | undefined, contracts: any): void {
      callback(null, compilationData, contracts, accounts)
    })
  }


  describe('testRunner', () => {
    describe('#runTest', () => {
      describe('test with beforeAll', () => {
        let filename = 'tests/examples_1/simple_storage_test.sol'
        let tests:any[] = [], results:Results;

        before((done) => {
          compileAndDeploy(filename, (_err: Error, compilationData: object, contracts: any, accounts: object) => {
            var testCallback = (test: object) => {
              tests.push(test)
            }
            var resultsCallback = (_err: Error, _results: Results) => {
              results = _results
              done()
            }
            runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], { accounts }, testCallback, resultsCallback)
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
            { type: 'contract',    value: 'MyTest', filename: 'tests/examples_1/simple_storage_test.sol' },
            { type: 'testFailure', value: 'Should trigger one fail', time: 1, context: 'MyTest', errMsg: 'the test 1 fails' },
            { type: 'testPass',    value: 'Should trigger one pass', time: 1, context: 'MyTest'},
            { type: 'testPass',    value: 'Initial value should be100', time: 1, context: 'MyTest' },
            { type: 'testFailure', value: 'Initial value should be200', time: 1, context: 'MyTest', errMsg: 'function returned false' }
          ])
        })
      })
    })
  })
