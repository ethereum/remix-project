import async from 'async'
import * as changeCase from 'change-case'
import Web3 from 'web3';
import { RunListInterface, TestCbInterface, TestResultInterface, ResultCbInterface,
    CompiledContract, AstNode, Options, FunctionDescription, UserDocumentation } from './types'

/**
 * @dev Get function name using method signature
 * @param signature siganture
 * @param methodIdentifiers Object containing all methods identifier
 */

function getFunctionFullName (signature: string, methodIdentifiers: Record <string, string>): string | null {
    for (const method in methodIdentifiers) {
        if (signature.replace('0x', '') === methodIdentifiers[method].replace('0x', '')) {
            return method
        }
    }
    return null
}

/**
 * @dev Check if function is constant using function ABI
 * @param funcABI function ABI
 */

function isConstant(funcABI: FunctionDescription): boolean {
    return (funcABI.constant || funcABI.stateMutability === 'view' || funcABI.stateMutability === 'pure')
}

/**
 * @dev Check if function is payable using function ABI
 * @param funcABI function ABI
 */

function isPayable(funcABI: FunctionDescription): boolean {
    return (funcABI.payable || funcABI.stateMutability === 'payable')
}

/**
 * @dev Get overrided sender provided using natspec
 * @param userdoc method user documentaion
 * @param signature signature
 * @param methodIdentifiers Object containing all methods identifier
 */

function getOverridedSender (userdoc: UserDocumentation, signature: string, methodIdentifiers: Record <string, string>): string | null {
    const fullName: string | null = getFunctionFullName(signature, methodIdentifiers)
    const senderRegex: RegExp = /#sender: account-+(\d)/g
    const accountIndex: RegExpExecArray | null = fullName && userdoc.methods[fullName] ? senderRegex.exec(userdoc.methods[fullName].notice) : null
    return fullName && accountIndex ? accountIndex[1] : null
}

/**
 * @dev Get value provided using natspec
 * @param userdoc method user documentaion
 * @param signature signature
 * @param methodIdentifiers Object containing all methods identifier
 */

function getProvidedValue (userdoc: UserDocumentation, signature: string, methodIdentifiers: Record <string, string>): string | null {
    const fullName: string | null = getFunctionFullName(signature, methodIdentifiers)
    const valueRegex: RegExp = /#value: (\d+)/g
    const value: RegExpExecArray | null = fullName && userdoc.methods[fullName] ? valueRegex.exec(userdoc.methods[fullName].notice) : null
    return fullName && value ? value[1] : null
}

/**
 * @dev returns functions of a test contract file in same sequence they appear in file (using passed AST)
 * @param fileAST AST of test contract file source
 * @param testContractName Name of test contract
 */

function getAvailableFunctions (fileAST: AstNode, testContractName: string): string[] {
    let funcList: string[] = []
    if(fileAST.nodes && fileAST.nodes.length > 0) {
        const contractAST: AstNode[] = fileAST.nodes.filter(node => node.name === testContractName && node.nodeType === 'ContractDefinition')
        if(contractAST.length > 0 && contractAST[0].nodes) {
            const funcNodes: AstNode[] = contractAST[0].nodes.filter(node => ((node.kind === "function" && node.nodeType === "FunctionDefinition") || (node.nodeType === "FunctionDefinition")))
            funcList = funcNodes.map(node => node.name)
        }
    }
    return funcList;
}

/**
 * @dev returns ABI of passed method list from passed interface
 * @param jsonInterface Json Interface
 * @param funcList Methods to extract the interface of
 */

function getTestFunctionsInterface (jsonInterface: FunctionDescription[], funcList: string[]): FunctionDescription[] {
    const functionsInterface: FunctionDescription[] = []
    const specialFunctions: string[] = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
    for(const func of funcList){
        if(!specialFunctions.includes(func)) {
            const funcInterface: FunctionDescription | undefined = jsonInterface.find(node => node.type === 'function' && node.name === func)
            if(funcInterface) functionsInterface.push(funcInterface)
        }
    }
    return functionsInterface
}

/**
 * @dev returns ABI of special functions from passed interface
 * @param jsonInterface Json Interface
 */

function getSpecialFunctionsInterface (jsonInterface: FunctionDescription[]): Record<string, FunctionDescription> {
    const specialFunctionsInterface: Record<string, FunctionDescription> = {}
    const funcList: string[] = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
    for(const func of funcList){
        const funcInterface: FunctionDescription | undefined = jsonInterface.find(node => node.type === 'function' && node.name === func)
        if(funcInterface) {
            specialFunctionsInterface[func] = funcInterface
        } 
    }
    return specialFunctionsInterface
}

/**
 * @dev Prepare a list of tests to run using test contract file ABI, AST & contract name
 * @param jsonInterface File JSON interface
 * @param fileAST File AST
 * @param testContractName Test contract name
 */

function createRunList (jsonInterface: FunctionDescription[], fileAST: AstNode, testContractName: string): RunListInterface[] {
    const availableFunctions: string[] = getAvailableFunctions(fileAST, testContractName)
    const testFunctionsInterface: FunctionDescription[] = getTestFunctionsInterface(jsonInterface, availableFunctions)
    const specialFunctionsInterface: Record<string, FunctionDescription> = getSpecialFunctionsInterface(jsonInterface)
    let runList: RunListInterface[] = []

    if (availableFunctions.includes('beforeAll')) {
        let func = specialFunctionsInterface['beforeAll']
        runList.push({ name: 'beforeAll', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
    }

    for (const func of testFunctionsInterface) {
        if (availableFunctions.includes('beforeEach')) {
            let func = specialFunctionsInterface['beforeEach']
            runList.push({ name: 'beforeEach', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
        }
        if(func.name && func.inputs) runList.push({ name: func.name, inputs: func.inputs, signature: func.signature, type: 'test', constant: isConstant(func), payable: isPayable(func) })
        if (availableFunctions.indexOf('afterEach') >= 0) {
            let func = specialFunctionsInterface['afterEach']
            runList.push({ name: 'afterEach', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
        }
    }

    if (availableFunctions.indexOf('afterAll') >= 0) {
        let func = specialFunctionsInterface['afterAll']
        runList.push({ name: 'afterAll', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
    }

    return runList
}

export function runTest (testName: string, testObject: any, contractDetails: CompiledContract, fileAST: AstNode, opts: Options, testCallback: TestCbInterface, resultsCallback: ResultCbInterface): void {
    let passingNum: number = 0
    let failureNum: number = 0
    let timePassed: number = 0
    const isJSONInterfaceAvailable = testObject && testObject.options && testObject.options.jsonInterface
    if(!isJSONInterfaceAvailable)
        return resultsCallback(new Error('Contract interface not available'), { passingNum, failureNum, timePassed })
    const runList: RunListInterface[] = createRunList(testObject.options.jsonInterface, fileAST, testName)
    const web3 = new Web3()
    const accts: TestResultInterface = {
      type: 'accountList',
      value: opts.accounts
    }
    testCallback(undefined, accts)

    const resp: TestResultInterface = {
      type: 'contract',
      value: testName,
      filename: testObject.filename
    }
    testCallback(undefined, resp)
    async.eachOfLimit(runList, 1, function (func, index, next) {
        let sender: string | null = null
        if (func.signature) {
            sender = getOverridedSender(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
            if (opts.accounts && sender) {
                sender = opts.accounts[sender]
            }
        }
        let sendParams: Record<string, string> | null = null
        if (sender) sendParams = { from: sender }
        if(func.inputs && func.inputs.length > 0)
            return resultsCallback(new Error(`Method '${func.name}' can not have parameters inside a test contract`), { passingNum, failureNum, timePassed })
        const method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
        const startTime = Date.now()
        if (func.constant) {
            method.call(sendParams).then((result) => {
                const time = (Date.now() - startTime) / 1000.0
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
            if(func.payable) {
                const value = getProvidedValue(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
                if(value) {
                    if(sendParams) sendParams.value = value
                    else sendParams = { value }
                }
            }
            method.send(sendParams).on('receipt', (receipt) => {
                try {
                    const time: number = (Date.now() - startTime) / 1000.0
                    const topic = Web3.utils.sha3('AssertionEvent(bool,string)')
                    let testPassed: boolean = false

                    for (const i in receipt.events) {
                        const event = receipt.events[i]
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
            }).on('error', function (err: Error) {
                const time: number = (Date.now() - startTime) / 1000.0
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
        resultsCallback(error, { passingNum, failureNum, timePassed })
    })
}
