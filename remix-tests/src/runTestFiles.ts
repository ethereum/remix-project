import async = require('async')
import path = require('path')
import fs = require('./fs')
import runTest from './testRunner'
require('colors')

import Compiler = require('./compiler.js')
import Deployer = require('./deployer.js')

function runTestFiles(filepath, isDirectory, web3, opts) {
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
    let accounts = opts.accounts || null
    async.waterfall([
        function getAccountList (next) {
            if (accounts) return next(null)
            web3.eth.getAccounts((_err, _accounts) => {
                accounts = _accounts
                next(null)
            })
        },
        function compile (next) {
            Compiler.compileFileOrFiles(filepath, isDirectory, { accounts }, next)
        },
        function deployAllContracts (compilationResult, next) {
            Deployer.deployAll(compilationResult, web3, function (err, contracts) {
                if (err) {
                    next(err)
                }
                next(null, compilationResult, contracts)
            })
        },
        function determineTestContractsToRun (compilationResult, contracts, next) {
            let contractsToTest: any[] = []
            let contractsToTestDetails: any[] = []
            const gatherContractsFrom = (filename) => {
                if (filename.indexOf('_test.sol') < 0) {
                    return
                }
                Object.keys(compilationResult[path.basename(filename)]).forEach(contractName => {
                    contractsToTest.push(contractName)
                    contractsToTestDetails.push(compilationResult[path.basename(filename)][contractName])
                })
            }
            if (isDirectory) {
                fs.walkSync(filepath, foundpath => {
                    gatherContractsFrom(foundpath)
                })
            } else {
                gatherContractsFrom(filepath)
            }
            next(null, contractsToTest, contractsToTestDetails, contracts)
        },
        function runTests (contractsToTest, contractsToTestDetails, contracts, next) {
            let totalPassing = 0
            let totalFailing = 0
            let totalTime = 0
            let errors: any[] = []

            var testCallback = function (result) {
                if (result.type === 'contract') {
                    signale.name(result.value.white)
                } else if (result.type === 'testPass') {
                    signale.result(result.value)
                } else if (result.type === 'testFailure') {
                    signale.result(result.value.red)
                    errors.push(result)
                }
            }
            var resultsCallback = function (_err, result, cb) {
                totalPassing += result.passingNum
                totalFailing += result.failureNum
                totalTime += result.timePassed
                cb()
            }

            async.eachOfLimit(contractsToTest, 1, (contractName, index, cb) => {
                runTest(contractName, contracts(contractName), contractsToTestDetails[index], { accounts }, testCallback, (err, result) => {
                    if (err) {
                        return cb(err)
                    }
                    resultsCallback(null, result, cb)
                })
            }, function (err) {
                if (err) {
                    return next(err)
                }

                console.log('\n')
                if (totalPassing > 0) {
                    console.log(('%c  ' + totalPassing + ' passing ') + ('%c(' + totalTime + 's)'),'color: green','color: grey')
                }
                if (totalFailing > 0) {
                    console.log(('%c  ' + totalFailing + ' failing'),'color: red')
                }
                console.log('')

                errors.forEach((error, index) => {
                    console.log('  ' + (index + 1) + ') ' + error.context + ' ' + error.value)
                    console.log('')
                    console.log(('%c\t error: ' + error.errMsg),'color: red')
                })
                console.log('')

                next()
            })
        }
    ], function () {
    })
}

export = runTestFiles;
