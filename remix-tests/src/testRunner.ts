import async from 'async'
import * as changeCase from 'change-case'
import Web3 = require('web3')
import { RunListInterface, TestCbInterface, TestResultInterface, ResultCbInterface } from './types'

function getFunctionFullName (signature: string, methodIdentifiers) {
    for (const method in methodIdentifiers) {
        if (signature.replace('0x', '') === methodIdentifiers[method].replace('0x', '')) {
            return method
        }
    }
    return null
}

function getOverridedSender (userdoc, signature: string, methodIdentifiers) {
    let fullName: any = getFunctionFullName(signature, methodIdentifiers)
    let match = /sender: account-+(\d)/g
    let accountIndex = userdoc.methods[fullName] ? match.exec(userdoc.methods[fullName].notice) : null
    return fullName && accountIndex ? accountIndex[1] : null
}

function getAvailableFunctions (jsonInterface) {
    return jsonInterface.reverse().filter((x) => x.type === 'function').map((x) => x.name)
}

function getTestFunctions (jsonInterface) {
    let specialFunctions = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
    return jsonInterface.filter((x) => specialFunctions.indexOf(x.name) < 0 && x.type === 'function')
}

function createRunList (jsonInterface): RunListInterface[] {
    let availableFunctions = getAvailableFunctions(jsonInterface)
    let testFunctions = getTestFunctions(jsonInterface)
    let runList: RunListInterface[] = []

    if (availableFunctions.indexOf('beforeAll') >= 0) {
        runList.push({ name: 'beforeAll', type: 'internal', constant: false })
    }

    for (let func of testFunctions) {
        if (availableFunctions.indexOf('beforeEach') >= 0) {
            runList.push({ name: 'beforeEach', type: 'internal', constant: false })
        }
        runList.push({ name: func.name, signature: func.signature, type: 'test', constant: func.constant })
        if (availableFunctions.indexOf('afterEach') >= 0) {
            runList.push({ name: 'afterEach', type: 'internal', constant: false })
        }
    }

    if (availableFunctions.indexOf('afterAll') >= 0) {
        runList.push({ name: 'afterAll', type: 'internal', constant: false })
    }

    return runList
}

export function runTest (testName, testObject: any, contractDetails: any, opts: any, testCallback: TestCbInterface, resultsCallback: ResultCbInterface) {
    let runList = createRunList(testObject._jsonInterface)

    let passingNum: number = 0
    let failureNum: number = 0
    let timePassed: number = 0
    let web3 = new Web3()

    const userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
    const isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)
    if (!isBrowser) {
        let signale = require('signale')
        signale.warn('DO NOT TRY TO ACCESS (IN YOUR SOLIDITY TEST) AN ACCOUNT GREATER THAN THE LENGTH OF THE FOLLOWING ARRAY (' + opts.accounts.length + ') :')
        signale.warn(opts.accounts)
        signale.warn('e.g: the following code won\'t work in the current context:')
        signale.warn('TestsAccounts.getAccount(' + opts.accounts.length + ')')
    }
    const resp: TestResultInterface = {
      type: 'contract',
      value: testName,
      filename: testObject.filename
    }
    testCallback(undefined, resp)
    async.eachOfLimit(runList, 1, function (func, index, next) {
        let sender
        if (func.signature) {
            sender = getOverridedSender(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
            if (opts.accounts) {
                sender = opts.accounts[sender]
            }
        }
        let sendParams
        if (sender) sendParams = { from: sender }

        let method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
        let startTime = Date.now()
        if (func.constant) {
            method.call(sendParams).then((result) => {
                let time = Math.ceil((Date.now() - startTime) / 1000.0)
                if (result) {
                    const resp: TestResultInterface = {
                      type: 'testPass',
                      value: changeCase.sentenceCase(func.name),
                      time: time,
                      context: testName
                    }
                    testCallback(undefined, resp)
                    passingNum += 1
                    timePassed += time
                } else {
                    const resp: TestResultInterface = {
                      type: 'testFailure',
                      value: changeCase.sentenceCase(func.name),
                      time: time,
                      errMsg: 'function returned false',
                      context: testName
                    }
                    testCallback(undefined, resp)
                    failureNum += 1
                }
                next()
            })
        } else {
            method.send(sendParams).on('receipt', (receipt) => {
                try {
                    let time: number = Math.ceil((Date.now() - startTime) / 1000.0)
                    let topic = Web3.utils.sha3('AssertionEvent(bool,string)')
                    let testPassed: boolean = false

                    for (let i in receipt.events) {
                        let event = receipt.events[i]
                        if (event.raw.topics.indexOf(topic) >= 0) {
                            const testEvent = web3.eth.abi.decodeParameters(['bool', 'string'], event.raw.data)
                            if (!testEvent[0]) {
                                const resp: TestResultInterface = {
                                  type: 'testFailure',
                                  value: changeCase.sentenceCase(func.name),
                                  time: time,
                                  errMsg: testEvent[1],
                                  context: testName
                                };
                                testCallback(undefined, resp)
                                failureNum += 1
                                return next()
                            }
                            testPassed = true
                        }
                    }

                    if (testPassed) {
                        const resp: TestResultInterface = {
                          type: 'testPass',
                          value: changeCase.sentenceCase(func.name),
                          time: time,
                          context: testName
                        }
                        testCallback(undefined, resp)
                        passingNum += 1
                    }

                    return next()
                } catch (err) {
                    console.error(err)
                    return next(err)
                }
            }).on('error', function (err: Error | null | undefined) {
                console.error(err)
                next(err)
            })
        }
    }, function(error) {
        resultsCallback(error, {
            passingNum: passingNum,
            failureNum: failureNum,
            timePassed: timePassed
        })
    })
}
