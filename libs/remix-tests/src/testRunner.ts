import async from 'async'
import * as changeCase from 'change-case'
import Web3 from 'web3'
import assertionEvents from './assertionEvents'
import {
  RunListInterface, TestCbInterface, TestResultInterface, ResultCbInterface,
  CompiledContract, AstNode, Options, FunctionDescription, UserDocumentation
} from './types'

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

function isConstant (funcABI: FunctionDescription): boolean {
  return (funcABI.constant || funcABI.stateMutability === 'view' || funcABI.stateMutability === 'pure')
}

/**
 * @dev Check if function is payable using function ABI
 * @param funcABI function ABI
 */

function isPayable (funcABI: FunctionDescription): boolean {
  return (funcABI.payable || funcABI.stateMutability === 'payable')
}

/**
 * @dev Check node name
 * @param node AST node
 * @param name name
 */

function isNodeName (node: AstNode, name: string): boolean {
  return node.name === name
}

/**
 * @dev Check node type
 * @param node AST node
 * @param type type
 */

function isNodeType (node: AstNode, type: string): boolean {
  return node.nodeType === type
}

/**
 * @dev Check if node type is from the typesList
 * @param node AST node to be checked
 * @param typesList list of types
 */

function isNodeTypeIn (node: AstNode, typesList: string[]): boolean {
  return typesList.includes(node.nodeType)
}

/**
 * @dev Get overrided sender provided using natspec
 * @param userdoc method user documentaion
 * @param signature signature
 * @param methodIdentifiers Object containing all methods identifier
 */

function getOverridedSender (userdoc: UserDocumentation, signature: string, methodIdentifiers: Record <string, string>): string | null {
  const fullName: string | null = getFunctionFullName(signature, methodIdentifiers)
  const senderRegex = /#sender: account-+(\d)/g
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
  const valueRegex = /#value: (\d+)/g
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
  if (fileAST.nodes && fileAST.nodes.length > 0) {
    const contractAST: AstNode[] = fileAST.nodes.filter(node => isNodeName(node, testContractName) && isNodeType(node, 'ContractDefinition'))
    if (contractAST.length > 0 && contractAST[0].nodes) {
      const funcNodes: AstNode[] = contractAST[0].nodes.filter(node => ((node.kind === 'function' && isNodeType(node, 'FunctionDefinition')) || isNodeType(node, 'FunctionDefinition')))
      funcList = funcNodes.map(node => node.name)
    }
  }
  return funcList
}

function getAssertMethodLocation (fileAST: AstNode, testContractName: string, functionName: string, assertMethod: string): string {
  if (fileAST.nodes?.length) {
    const contractAST: AstNode = fileAST.nodes.find(node => isNodeName(node, testContractName) && isNodeType(node, 'ContractDefinition'))
    if (contractAST?.nodes?.length) {
      const funcNode: AstNode = contractAST.nodes.find(node => isNodeName(node, functionName) && isNodeType(node, 'FunctionDefinition'))
      // Check if statement nodeType is 'ExpressionStatement' or 'Return', for examples:
      // Assert.equal(foo.get(), 100, "initial value is not correct");
      // return Assert.equal(foo.get(), 100, "initial value is not correct");
      const expressions = funcNode.body.statements.filter(s =>
        isNodeTypeIn(s, ['ExpressionStatement', 'Return']) &&
                                                    isNodeType(s.expression, 'FunctionCall'))
      const assetExpression = expressions.find(e => e.expression.expression &&
                                                    isNodeType(e.expression.expression, 'MemberAccess') &&
                                                    e.expression.expression.memberName === assertMethod &&
                                                    isNodeName(e.expression.expression.expression, 'Assert')
      )
      return assetExpression?.expression?.src
    }
  }
}

/**
 * @dev returns ABI of passed method list from passed interface
 * @param jsonInterface Json Interface
 * @param funcList Methods to extract the interface of
 */

function getTestFunctionsInterface (jsonInterface: FunctionDescription[], funcList: string[]): FunctionDescription[] {
  const functionsInterface: FunctionDescription[] = []
  const specialFunctions: string[] = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
  for (const func of funcList) {
    if (!specialFunctions.includes(func)) {
      const funcInterface: FunctionDescription | undefined = jsonInterface.find(node => node.type === 'function' && node.name === func)
      if (funcInterface) functionsInterface.push(funcInterface)
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
  for (const func of funcList) {
    const funcInterface: FunctionDescription | undefined = jsonInterface.find(node => node.type === 'function' && node.name === func)
    if (funcInterface) {
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
  const runList: RunListInterface[] = []

  if (availableFunctions.includes('beforeAll')) {
    const func = specialFunctionsInterface['beforeAll']
    runList.push({ name: 'beforeAll', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
  }

  for (const func of testFunctionsInterface) {
    if (availableFunctions.includes('beforeEach')) {
      const func = specialFunctionsInterface['beforeEach']
      runList.push({ name: 'beforeEach', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
    }
    if (func.name && func.inputs) runList.push({ name: func.name, inputs: func.inputs, signature: func.signature, type: 'test', constant: isConstant(func), payable: isPayable(func) })
    if (availableFunctions.indexOf('afterEach') >= 0) {
      const func = specialFunctionsInterface['afterEach']
      runList.push({ name: 'afterEach', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
    }
  }

  if (availableFunctions.indexOf('afterAll') >= 0) {
    const func = specialFunctionsInterface['afterAll']
    runList.push({ name: 'afterAll', inputs: func.inputs, signature: func.signature, type: 'internal', constant: isConstant(func), payable: isPayable(func) })
  }

  return runList
}

export function runTest (testName: string, testObject: any, contractDetails: CompiledContract, fileAST: AstNode, opts: Options, testCallback: TestCbInterface, resultsCallback: ResultCbInterface): void {
  let passingNum = 0
  let failureNum = 0
  let timePassed = 0
  const isJSONInterfaceAvailable = testObject && testObject.options && testObject.options.jsonInterface
  if (!isJSONInterfaceAvailable) { return resultsCallback(new Error('Contract interface not available'), { passingNum, failureNum, timePassed }) }
  const runList: RunListInterface[] = createRunList(testObject.options.jsonInterface, fileAST, testName)
  const web3 = opts.web3 || new Web3()
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
    let hhLogs
    if (func.signature) {
      sender = getOverridedSender(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
      if (opts.accounts && sender) {
        sender = opts.accounts[sender]
      }
    }
    let sendParams: Record<string, any> | null = null
    if (sender) sendParams = { from: sender }
    if (func.inputs && func.inputs.length > 0) { return resultsCallback(new Error(`Method '${func.name}' can not have parameters inside a test contract`), { passingNum, failureNum, timePassed }) }
    const method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
    const startTime = Date.now()
    let debugTxHash:string
    if (func.constant) {
      sendParams = {}
      const tagTimestamp = 'remix_tests_tag' + Date.now()
      sendParams.timestamp = tagTimestamp
      method.call(sendParams).then(async (result) => {
        const time = (Date.now() - startTime) / 1000.0
        let tagTxHash
        if (web3.eth && web3.eth.getHashFromTagBySimulator) tagTxHash = await web3.eth.getHashFromTagBySimulator(tagTimestamp)
        if (web3.eth && web3.eth.getHHLogsForTx) hhLogs = await web3.eth.getHHLogsForTx(tagTxHash)
        debugTxHash = tagTxHash
        if (result) {
          const resp: TestResultInterface = {
            type: 'testPass',
            value: changeCase.sentenceCase(func.name),
            filename: testObject.filename,
            time: time,
            context: testName,
            web3,
            debugTxHash
          }
          if (hhLogs && hhLogs.length) resp.hhLogs = hhLogs
          testCallback(undefined, resp)
          passingNum += 1
          timePassed += time
        } else {
          const resp: TestResultInterface = {
            type: 'testFailure',
            value: changeCase.sentenceCase(func.name),
            filename: testObject.filename,
            time: time,
            errMsg: 'function returned false',
            context: testName,
            web3,
            debugTxHash
          }
          if (hhLogs && hhLogs.length) resp.hhLogs = hhLogs
          testCallback(undefined, resp)
          failureNum += 1
          timePassed += time
        }
        next()
      })
    } else {
      if (func.payable) {
        const value = getProvidedValue(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
        if (value) {
          if (sendParams) sendParams.value = value
          else sendParams = { value }
        }
      }
      if (!sendParams) sendParams = {}
      sendParams.gas = 10000000 * 8
      method.send(sendParams).on('receipt', async (receipt) => {
        try {
          debugTxHash = receipt.transactionHash
          if (web3.eth && web3.eth.getHHLogsForTx) hhLogs = await web3.eth.getHHLogsForTx(receipt.transactionHash)
          const time: number = (Date.now() - startTime) / 1000.0
          const assertionEventHashes = assertionEvents.map(e => Web3.utils.sha3(e.name + '(' + e.params.join() + ')'))
          let testPassed = false
          for (const i in receipt.events) {
            let events = receipt.events[i]
            if (!Array.isArray(events)) events = [events]
            for (const event of events) {
              const eIndex = assertionEventHashes.indexOf(event.raw.topics[0]) // event name topic will always be at index 0
              if (eIndex >= 0) {
                const testEvent = web3.eth.abi.decodeParameters(assertionEvents[eIndex].params, event.raw.data)
                if (!testEvent[0]) {
                  const assertMethod = testEvent[2]
                  if (assertMethod === 'ok') { // for 'Assert.ok' method
                    testEvent[3] = 'false'
                    testEvent[4] = 'true'
                  }
                  const location = getAssertMethodLocation(fileAST, testName, func.name, assertMethod)
                  const resp: TestResultInterface = {
                    type: 'testFailure',
                    value: changeCase.sentenceCase(func.name),
                    filename: testObject.filename,
                    time: time,
                    errMsg: testEvent[1],
                    context: testName,
                    assertMethod,
                    returned: testEvent[3],
                    expected: testEvent[4],
                    location,
                    web3,
                    debugTxHash
                  }
                  if (hhLogs && hhLogs.length) resp.hhLogs = hhLogs
                  testCallback(undefined, resp)
                  failureNum += 1
                  timePassed += time
                  return next()
                }
                testPassed = true
              }
            }
          }

          if (testPassed) {
            const resp: TestResultInterface = {
              type: 'testPass',
              value: changeCase.sentenceCase(func.name),
              filename: testObject.filename,
              time: time,
              context: testName,
              web3,
              debugTxHash
            }
            if (hhLogs && hhLogs.length) resp.hhLogs = hhLogs
            testCallback(undefined, resp)
            passingNum += 1
            timePassed += time
          } else if (hhLogs && hhLogs.length) {
            const resp: TestResultInterface = {
              type: 'logOnly',
              value: changeCase.sentenceCase(func.name),
              filename: testObject.filename,
              time: time,
              context: testName,
              hhLogs
            }
            testCallback(undefined, resp)
            timePassed += time
          }

          return next()
        } catch (err) {
          console.error(err)
          return next(err)
        }
      }).on('error', async (err: Error) => {
        const time: number = (Date.now() - startTime) / 1000.0
        const resp: TestResultInterface = {
          type: 'testFailure',
          value: changeCase.sentenceCase(func.name),
          filename: testObject.filename,
          time: time,
          errMsg: err.message,
          context: testName,
          web3
        }
        if (err.message.includes('Transaction has been reverted by the EVM')) {
          const txHash = JSON.parse(err.message.replace('Transaction has been reverted by the EVM:', '')).transactionHash
          if (web3.eth && web3.eth.getHHLogsForTx) hhLogs = await web3.eth.getHHLogsForTx(txHash)
          if (hhLogs && hhLogs.length) resp.hhLogs = hhLogs
          resp.debugTxHash = txHash
        }
        testCallback(undefined, resp)
        failureNum += 1
        timePassed += time
        return next()
      })
    }
  }, function (error) {
    resultsCallback(error, { passingNum, failureNum, timePassed })
  })
}
