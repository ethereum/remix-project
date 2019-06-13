import async from 'async'
import fs from './fileSystem'
import { runTest } from './testRunner'
import { TestResultInterface, ResultsInterface } from './types'
import colors from 'colors'
import Web3 = require('web3')

import { compileFileOrFiles } from './compiler'
import { deployAll } from './deployer'

export function runTestFiles(filepath: string, isDirectory: boolean, web3: Web3, opts?: object) {
    opts = opts || {}
    const { Signale } = require('signale')
    // signale configuration
    const options = {
        types: {
            result: {
                badge: '\t✓',
                label: '',
                color: 'greenBright'
            },
            name: {
                badge: '\n\t◼',
                label: '',
                color: 'white'
            },
            error: {
                badge: '\t✘',
                label: '',
                color: 'redBright'
            }
        }
    }
    const signale = new Signale(options)
    let accounts = opts['accounts'] || null
    async.waterfall([
        function getAccountList (next: Function) {
            if (accounts) return next(null)
            web3.eth.getAccounts((_err: Error | null | undefined, _accounts) => {
                accounts = _accounts
                next(null)
            })
        },
        function compile(next: Function) {
            compileFileOrFiles(filepath, isDirectory, { accounts }, next)
        },
        function deployAllContracts (compilationResult, next: Function) {
            deployAll(compilationResult, web3, (err, contracts) => {
                if (err) {
                    next(err)
                }
                next(null, compilationResult, contracts)
            })
        },
        function determineTestContractsToRun (compilationResult, contracts, next: Function) {
            let contractsToTest: any[] = []
            let contractsToTestDetails: any[] = []
            const gatherContractsFrom = function(filename: string) {
                if (filename.indexOf('_test.sol') < 0) {
                    return
                }
                try {
                  Object.keys(compilationResult[filename]).forEach(contractName => {
                      contractsToTest.push(contractName)
                      contractsToTestDetails.push(compilationResult[filename][contractName])
                  })
                } catch (e) {
                  console.error(e)
                }
            }
            if (isDirectory) {
                fs.walkSync(filepath, (foundpath: string) => {
                    gatherContractsFrom(foundpath)
                })
            } else {
                gatherContractsFrom(filepath)
            }
            next(null, contractsToTest, contractsToTestDetails, contracts)
        },
        function runTests(contractsToTest, contractsToTestDetails, contracts, next: Function) {
            let totalPassing: number = 0
            let totalFailing: number = 0
            let totalTime: number = 0
            let errors: any[] = []

            const _testCallback = function (err: Error | null | undefined, result: TestResultInterface) {
                if(err) throw err;
                if (result.type === 'contract') {
                    signale.name(result.value.white)
                } else if (result.type === 'testPass') {
                    signale.result(result.value)
                } else if (result.type === 'testFailure') {
                    signale.result(result.value.red)
                    errors.push(result)
                }
            }
            const _resultsCallback = (_err: Error | null | undefined, result: ResultsInterface, cb) => {
                totalPassing += result.passingNum
                totalFailing += result.failureNum
                totalTime += result.timePassed
                cb()
            }

            async.eachOfLimit(contractsToTest, 1, (contractName: string, index, cb) => {
              try {
                runTest(contractName, contracts[contractName], contractsToTestDetails[index], { accounts }, _testCallback, (err, result) => {
                    if (err) {
                      console.log(err)
                        return cb(err)
                    }
                    _resultsCallback(null, result, cb)
                })
              } catch(e) {
                console.error(e)
              }
            }, function (err) {
                if (err) {
                    return next(err)
                }

                console.log('\n')
                if (totalPassing > 0) {
                    console.log(colors.green(totalPassing + ' passing ') + colors.grey('(' + totalTime + 's)'))
                }
                if (totalFailing > 0) {
                    console.log(colors.red(totalFailing + ' failing'))
                }
                console.log('')

                errors.forEach((error, index) => {
                    console.log('  ' + (index + 1) + ') ' + error.context + ' ' + error.value)
                    console.log('')
                    console.log(colors.red('\t error: ' + error.errMsg))
                })
                console.log('')

                next()
            })
        }
    ], () => {
    })
}
