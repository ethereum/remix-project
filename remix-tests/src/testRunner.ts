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

function getAvailableFunctions (fileAST, testContractName) {
    let contractAST: any[] = fileAST.nodes.filter(node => node.name === testContractName && node.nodeType === 'ContractDefinition')
    let funcNodes: any[] = contractAST[0].nodes.filter(node => node.kind === 'function' && node.nodeType === "FunctionDefinition")
    let funcList: string[] = funcNodes.map(node => node.name)
    return funcList;
}

function getTestFunctionsInterface (jsonInterface, funcList: string[]) {
    let resutantInterface: any[] = []
    let specialFunctions = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
    for(const func of funcList){
        if(!specialFunctions.includes(func))
            resutantInterface.push(jsonInterface.find(node => node.type === 'function' && node.name === func))
    }
    return resutantInterface
}

function createRunList (jsonInterface, fileAST, testContractName): RunListInterface[] {
    let availableFunctions = getAvailableFunctions(fileAST, testContractName)
    let testFunctionsInterface = getTestFunctionsInterface(jsonInterface, availableFunctions)

    let runList: RunListInterface[] = []

    if (availableFunctions.indexOf('beforeAll') >= 0) {
        runList.push({ name: 'beforeAll', type: 'internal', constant: false })
    }

    for (let func of testFunctionsInterface) {
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

export function runTest (testName, testObject: any, contractDetails: any, fileAST: any, opts: any, testCallback: TestCbInterface, resultsCallback: ResultCbInterface) {
    let runList = createRunList(testObject._jsonInterface, fileAST, testName)
    let passingNum: number = 0
    let failureNum: number = 0
    let timePassed: number = 0
    let web3 = new Web3()

    const accts: TestResultInterface = {
      type: 'accountList',
      value: opts.accounts
    }

    testCallback(undefined, accts);

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
                let time = (Date.now() - startTime) / 1000.0
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
                    let time: number = (Date.now() - startTime) / 1000.0
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
            }).on('error', function (err: any) {
                console.error(err)
                let time: number = (Date.now() - startTime) / 1000.0
                const resp: TestResultInterface = {
                    type: 'testFailure',
                    value: changeCase.sentenceCase(func.name),
                    time: time,
                    errMsg: err.message,
                    context: testName
                  };
                  testCallback(undefined, resp)
                  failureNum += 1
                return next()
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
