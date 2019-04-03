import async, { ErrorCallback } from 'async'
require('colors')

import { compileContractSources } from './compiler'
import { deployAll } from './deployer'
import { runTest } from './testRunner'
import { TestResultInterface, ResultsInterface } from './types'

import Web3 = require('web3')
import { Provider } from 'remix-simulator'
import { FinalResult } from './types'

const createWeb3Provider = function () {
    let web3 = new Web3()
    web3.setProvider(new Provider())
    return web3
}

export function runTestSources(contractSources, testCallback, resultCallback, finalCallback, importFileCb, opts) {
    opts = opts || {}
    let web3 = opts.web3 || createWeb3Provider()
    let accounts = opts.accounts || null
    async.waterfall([
        function getAccountList (next) {
            if (accounts) return next()
            web3.eth.getAccounts((_err, _accounts) => {
                accounts = _accounts
                next()
            })
        },
        function compile (next) {
            compileContractSources(contractSources, importFileCb, { accounts }, next)
        },
        function deployAllContracts (compilationResult, next) {
            deployAll(compilationResult, web3, (err, contracts) => {
                if (err) {
                    next(err)
                }

                next(null, compilationResult, contracts)
            })
        },
        function determineTestContractsToRun (compilationResult, contracts, next) {
            let contractsToTest: any[] = []
            let contractsToTestDetails: any[] = []

            for (let filename in compilationResult) {
                if (filename.indexOf('_test.sol') < 0) {
                    continue
                }
                Object.keys(compilationResult[filename]).forEach(contractName => {
                    contractsToTestDetails.push(compilationResult[filename][contractName])
                    contractsToTest.push(contractName)
                })
            }
            next(null, contractsToTest, contractsToTestDetails, contracts)
        },
        function runTests(contractsToTest, contractsToTestDetails, contracts, next) {
            let totalPassing = 0
            let totalFailing = 0
            let totalTime = 0
            let errors: any[] = []

            const _testCallback = function (err: Error | null | undefined, result: TestResultInterface) {
                if (result.type === 'testFailure') {
                    errors.push(result)
                }
                testCallback(result)
            }

            const _resultsCallback = function (_err, result, cb) {
                resultCallback(_err, result, () => {})
                totalPassing += result.passingNum
                totalFailing += result.failureNum
                totalTime += result.timePassed
                cb()
            }

            async.eachOfLimit(contractsToTest, 1, (contractName: string, index: string | number, cb: ErrorCallback) => {
                runTest(contractName, contracts[contractName], contractsToTestDetails[index], { accounts }, _testCallback, (err, result) => {
                    if (err) {
                        return cb(err)
                    }
                    _resultsCallback(null, result, cb)
                })
            }, function (err) {
                if (err) {
                    return next(err)
                }

                let finalResults: FinalResult = {
                    totalPassing: 0,
                    totalFailing: 0,
                    totalTime: 0,
                    errors: [],
                }

                finalResults.totalPassing = totalPassing || 0
                finalResults.totalFailing = totalFailing || 0
                finalResults.totalTime = totalTime || 0
                finalResults.errors = []

                errors.forEach((error, _index) => {
                    finalResults.errors.push({context: error.context, value: error.value, message: error.errMsg})
                })

                next(null, finalResults)
            })
        }
    ], finalCallback)
}
