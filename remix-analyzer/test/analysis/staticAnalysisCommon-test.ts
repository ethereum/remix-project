import { default as test} from "tape"
import * as common from '../../src/solidity-analyzer/modules/staticAnalysisCommon'
const { localCall, thisLocalCall, libCall, externalDirect, superLocal, assignment, abiNamespaceCallNodes,
    inlineAssembly, unaryOperation, nowAst, blockTimestamp, stateVariableContractNode,
    functionDefinition, requireCall, selfdestruct, storageVariableNodes, dynamicDeleteUnaryOp,
    lowlevelCall, parameterFunction, parameterFunctionCall, inheritance, blockHashAccess, contractDefinition, funcDefForComplexParams } = require('./astBlocks')


const compiledContractObj = require('./compilationDetails/CompiledContractObj.json')
function escapeRegExp (str) {
  return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&')
}

test('staticAnalysisCommon.helpers.buildFunctionSignature', function (t) {
  t.plan(11)

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.UINT, common.basicTypes.ADDRESS], [common.basicTypes.BOOL], false),
    'function (uint256,address) returns (bool)',
    'two params and return value without payable')

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.UINT, common.basicTypes.ADDRESS], [common.basicTypes.BOOL], false, 'pure'),
    'function (uint256,address) pure returns (bool)',
    'two params and return value without payable but pure')

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.UINT, common.basicTypes.ADDRESS], [common.basicTypes.BOOL], true, 'pure'),
    'function (uint256,address) payable pure returns (bool)',
    'two params and return value without payable but pure')

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.UINT, common.basicTypes.BYTES32, common.basicTypes.BYTES32], [], true),
    'function (uint256,bytes32,bytes32) payable',
    'three params and no return with payable')

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.BOOL], [common.basicTypes.BYTES32, common.basicTypes.ADDRESS], true),
    'function (bool) payable returns (bytes32,address)',
    'one param and two return values with payable')

  t.equal(common.lowLevelCallTypes.CALL.type,
    'function (bytes memory) payable returns (bool,bytes memory)',
    'check fixed call type')

t.equal(common.lowLevelCallTypes['CALL-0.4'].type,
    'function () payable returns (bool)',
    'check fixed call type for versions before 0.5.0')

t.equal(common.lowLevelCallTypes.CALLCODE.type,
    'function () payable returns (bool)',
    'check fixed callcode type')

  t.equal(common.lowLevelCallTypes.SEND.type,
    'function (uint256) returns (bool)',
    'check fixed send type')

  t.equal(common.lowLevelCallTypes.DELEGATECALL.type,
    'function (bytes memory) returns (bool,bytes memory)',
    'check fixed delegatecall type')

t.equal(common.lowLevelCallTypes['DELEGATECALL-0.4'].type,
    'function () returns (bool)',
    'check fixed delegatecall type for version before 0.5.0')
})

// #################### Node Identification Primitives

test('staticAnalysisCommon.helpers.name', function (t) {
  t.plan(3)
  const node = { name: 'now' }
  const node2 = { memberName: 'call' }

  t.ok(common.helpers.memName(node, 'now'), 'should work for names')
  t.ok(common.helpers.memName(node2, 'call'), 'should work for memberName')
  t.ok(common.helpers.memName(node2, '.all'), 'regex should work')
})

test('staticAnalysisCommon.helpers.operator', function (t) {
  t.plan(4)
  const node = { operator: '++' }
  const node2 = { operator: '+++' }

  const escapedPP = escapeRegExp('++')
  const escapedPPExact = `^${escapedPP}$`

  t.ok(common.helpers.operator(node, escapedPPExact), 'should work for ++')
  t.notOk(common.helpers.operator(node2, escapedPPExact), 'should not work for +++')
  t.ok(common.helpers.operator(node, escapedPP), 'should work for ++')
  t.ok(common.helpers.operator(node2, escapedPP), 'should work for +++')
})

test('staticAnalysisCommon.helpers.nodeType', function (t) {
  t.plan(3)
  const node = { nodeType: 'Identifier', name: 'now'}
  const node2 = { nodeType: 'FunctionCall', memberName: 'call' }

  t.ok(common.helpers.nodeType(node, common.nodeTypes.IDENTIFIER), 'should work for identifier')
  t.ok(common.helpers.nodeType(node2, common.nodeTypes.FUNCTIONCALL), 'should work for function call')
  t.ok(common.helpers.nodeType(node2, '^F'), 'regex should work for function call')
})

test('staticAnalysisCommon.helpers.expressionTypeDescription', function (t) {
  t.plan(3)
  const node = {
    "expression":
    {
      "argumentTypes":
      [
        {
          "typeIdentifier": "t_stringliteral_c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          "typeString": "literal_string \"\""
        }
      ],
      "expression":
      {
        "name": "addr",
        "nodeType": "Identifier",
        "src": "132:4:0",
        "typeDescriptions":
        {
          "typeIdentifier": "t_address_payable",
          "typeString": "address payable"
        }
      },
      "memberName": "call",
      "nodeType": "MemberAccess",
      "typeDescriptions":
      {
        "typeIdentifier": "t_function_barecall_payable$_t_bytes_memory_ptr_$returns$_t_bool_$_t_bytes_memory_ptr_$",
        "typeString": "function (bytes memory) payable returns (bool,bytes memory)"
      }
    },
    "nodeType": "FunctionCall",
  }

  t.ok(common.helpers.expressionTypeDescription(node.expression, common.basicTypes.PAYABLE_ADDRESS), 'should work for ident')
  t.ok(common.helpers.expressionTypeDescription(node, escapeRegExp(common.basicFunctionTypes.CALL)), 'should work for funcall')
  t.ok(common.helpers.expressionTypeDescription(node, '^function \\('), 'regex should work')
})

// #################### Trivial Getter Test

test('staticAnalysisCommon.getType', function (t) {
  t.plan(3)
  const node =  { "argumentTypes": null,
                  "id": 3,
                  "name": "a",
                  "nodeType": "Identifier",
                  "overloadedDeclarations": [],
                  "referencedDeclaration": 22,
                  "src": "52:1:0",
                  "typeDescriptions":
                  {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                }
  t.ok(common.getType(blockHashAccess) === 'bytes32', 'gettype should work for different nodes')
  t.ok(common.getType(node) === 'uint256', 'gettype should work for different nodes')
  t.ok(common.getType(assignment) === 'uint256', 'gettype should work for different nodes')
})

// #################### Complex Getter Test

test('staticAnalysisCommon.getFunctionCallType', function (t) {
  t.plan(4)
  t.equal(common.getFunctionCallType(libCall), 'function (struct Set.Data storage pointer,uint256) returns (bool)', 'this lib call returns correct type')
  t.equal(common.getFunctionCallType(thisLocalCall), 'function () external returns (uint256,uint256)', 'this local call returns correct type')
  t.equal(common.getFunctionCallType(localCall), 'function (uint256,string memory)', 'local call returns correct type')
  t.equal(common.getFunctionCallType(externalDirect), 'function () external', 'external call returns correct type')
})

test('staticAnalysisCommon.getEffectedVariableName', function (t) {
  t.plan(3)
  t.ok(common.getEffectedVariableName(assignment) === 'a', 'get right name for assignment')
  t.throws(() => common.getEffectedVariableName(inlineAssembly), new RegExp('staticAnalysisCommon.js: wrong node type'), 'staticAnalysisCommon.js: not an effect Node or inline assembly, get from inline assembly should throw')
  t.throws(() => common.getEffectedVariableName(externalDirect), new RegExp('staticAnalysisCommon.js: not an effect Node'), 'should throw on all other nodes')
})

test('staticAnalysisCommon.getLocalCallName', function (t) {
  t.plan(3)
  t.ok(common.getLocalCallName(localCall) === 'e', 'getLocal call name from node')
  t.throws(() => common.getLocalCallName(externalDirect), new RegExp('staticAnalysisCommon.js: not a local call Node'), 'throws for externalDirect nodes')
  t.throws(() => common.getLocalCallName(thisLocalCall), new RegExp('staticAnalysisCommon.js: not a local call Node'), 'throws for this local call nodes')
})

test('staticAnalysisCommon.getThisLocalCallName', function (t) {
  t.plan(3)
  t.ok(common.getThisLocalCallName(thisLocalCall) === 'f', 'get this Local call name from node')
  t.throws(() => common.getThisLocalCallName(externalDirect), new RegExp('staticAnalysisCommon.js: not a this local call Node'), 'throws on externalDirect nodes')
  t.throws(() => common.getThisLocalCallName(localCall), new RegExp('staticAnalysisCommon.js: not a this local call Node'), 'throws on localCall nodes')
})

test('staticAnalysisCommon.getSuperLocalCallName', function (t) {
  t.plan(4)
  t.equal(common.getSuperLocalCallName(superLocal), 'x', 'get local name from super local call')
  t.throws(() => common.getSuperLocalCallName(thisLocalCall), new RegExp('staticAnalysisCommon.js: not a super local call Node'), 'throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(externalDirect), new RegExp('staticAnalysisCommon.js: not a super local call Node'),' throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(localCall), new RegExp('staticAnalysisCommon.js: not a super local call Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallContractName', function (t) {
  t.plan(3)
  t.ok(common.getExternalDirectCallContractName(externalDirect) === 'c', 'external direct call contract name from node')
  t.throws(() => common.getExternalDirectCallContractName(thisLocalCall), new RegExp('staticAnalysisCommon.js: not an external direct call Node'), 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallContractName(localCall), new RegExp('staticAnalysisCommon.js: not an external direct call Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getThisLocalCallContractName', function (t) {
  t.plan(3)
  t.ok(common.getThisLocalCallContractName(thisLocalCall) === 'C', 'this local call contract name from node')
  t.throws(() => common.getThisLocalCallContractName(localCall), new RegExp('staticAnalysisCommon.js: not a this local call Node'), 'throws on other nodes')
  t.throws(() => common.getThisLocalCallContractName(externalDirect), new RegExp('staticAnalysisCommon.js: not a this local call Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallMemberName', function (t) {
  t.plan(3)
  t.ok(common.getExternalDirectCallMemberName(externalDirect) === 'f', 'external direct call name from node')
  t.throws(() => common.getExternalDirectCallMemberName(thisLocalCall), new RegExp('staticAnalysisCommon.js: not an external direct call Node'), 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallMemberName(localCall), new RegExp('staticAnalysisCommon.js: not an external direct call Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getContractName', function (t) {
  t.plan(2)
  t.ok(common.getContractName(contractDefinition) === 'C', 'returns right contract name')
  t.throws(() => common.getContractName(inheritance), new RegExp('staticAnalysisCommon.js: not a ContractDefinition Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionDefinitionName', function (t) {
  t.plan(2)
  t.ok(common.getFunctionDefinitionName(functionDefinition) === 'f', 'returns right function name')
  t.throws(() => common.getFunctionDefinitionName(inheritance), new RegExp('staticAnalysisCommon.js: not a FunctionDefinition Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getInheritsFromName', function (t) {
  t.plan(2)
  t.ok(common.getInheritsFromName(inheritance) === 'A', 'returns right contract name')
  t.throws(() => common.getInheritsFromName(functionDefinition), new RegExp('staticAnalysisCommon.js: not an InheritanceSpecifier Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getDeclaredVariableName', function (t) {
  t.plan(2)
  t.ok(common.getDeclaredVariableName(storageVariableNodes.node1) === 'c', 'extract right variable name')
  let node1 = JSON.parse(JSON.stringify(storageVariableNodes))
  node1.node1.nodeType = 'FunctionCall'
  t.throws(() => common.getDeclaredVariableName(node1) === 'x', new RegExp('staticAnalysisCommon.js: not a VariableDeclaration Node'), 'throw if wrong node')
})

test('staticAnalysisCommon.getStateVariableDeclarationsFromContractNode', function (t) {
  t.plan(3)
  const res = common.getStateVariableDeclarationsFromContractNode(stateVariableContractNode).map(common.getDeclaredVariableName)
  t.ok(res[0] === 'x', 'var 1 should be x')
  t.ok(res[1] === 'b', 'var 2 should be b')
  t.ok(res[2] === 's', 'var 3 should be s')
})

test('staticAnalysisCommon.getFunctionOrModifierDefinitionParameterPart', function (t) {
  t.plan(2)
  t.ok(common.helpers.nodeType(common.getFunctionOrModifierDefinitionParameterPart(functionDefinition), 'ParameterList'), 'should return a parameterList')
  t.throws(() => common.getFunctionOrModifierDefinitionParameterPart(contractDefinition), new RegExp('staticAnalysisCommon.js: not a FunctionDefinition or ModifierDefinition Node'), 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionCallTypeParameterType', function (t) {
  t.plan(4)
  t.ok(common.getFunctionCallTypeParameterType(thisLocalCall) === '', 'this local call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(externalDirect) === '', 'external direct call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(localCall) === 'uint256,string memory', 'local call returns correct type')
  t.throws(() => common.getFunctionCallTypeParameterType(thisLocalCall.expression), new RegExp('staticAnalysisCommon.js: cannot extract parameter types from function call'), 'throws on wrong type')
})

test('staticAnalysisCommon.getLibraryCallContractName', function (t) {
  t.plan(2)
  t.equal(common.getLibraryCallContractName(libCall), 'Set', 'should return correct contract name')
  t.throws(() => common.getLibraryCallContractName(contractDefinition), new RegExp('staticAnalysisCommon.js: not a library call Node'), 'should throw on wrong node')
})

test('staticAnalysisCommon.getLibraryCallMemberName', function (t) {
  t.plan(2)
  t.equal(common.getLibraryCallMemberName(libCall), 'insert', 'should return correct member name')
  t.throws(() => common.getLibraryCallMemberName(thisLocalCall), new RegExp('staticAnalysisCommon.js: not a library call Node'), 'should throw on wrong node')
})

test('staticAnalysisCommon.getFullQualifiedFunctionCallIdent', function (t) {
  t.plan(4)
  t.ok(common.getFullQualifiedFunctionCallIdent(contractDefinition, thisLocalCall) === 'C.f()', 'this local call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contractDefinition, externalDirect) === 'c.f()', 'external direct call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contractDefinition, localCall) === 'C.e(uint256,string memory)', 'local call returns correct type')
  t.throws(() => common.getFullQualifiedFunctionCallIdent(contractDefinition, assignment), new RegExp('staticAnalysisCommon.js: Can not get function name from non function call node'), 'throws on wrong type')
})

test('staticAnalysisCommon.getFullQuallyfiedFuncDefinitionIdent', function (t) {
  t.plan(3)
  t.ok(common.getFullQuallyfiedFuncDefinitionIdent(contractDefinition, functionDefinition, ['uint256', 'bool']) === 'C.f(uint256,bool)', 'creates right signature')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent(contractDefinition, parameterFunctionCall, ['uint256', 'bool']), new RegExp('staticAnalysisCommon.js: not a FunctionDefinition Node'), 'throws on wrong nodes')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent(parameterFunctionCall, functionDefinition, ['uint256', 'bool']), new RegExp('staticAnalysisCommon.js: not a ContractDefinition Node'), 'throws on wrong nodes')
})

test('staticAnalysisCommon.getSplittedTypeDesc', function (t) {
  t.plan(3)
  t.ok(common.getMethodParamsSplittedTypeDesc(funcDefForComplexParams.withoutParams, compiledContractObj).length === 0, 'no params, no params type signature')
  t.ok(common.getMethodParamsSplittedTypeDesc(funcDefForComplexParams.bytesArray, compiledContractObj)[0] === 'bytes32[]', 'creates right params type signature')
  t.ok(common.getMethodParamsSplittedTypeDesc(funcDefForComplexParams.nestedStruct, compiledContractObj)[0] === '(bytes32,uint256,uint256[],address,(bytes32,uint256)[])[][]', 'creates right params type signature')
})

// #################### Complex Node Identification

test('staticAnalysisCommon.isBuiltinFunctionCall', function (t) {
  t.plan(1)
  t.ok(common.isBuiltinFunctionCall(selfdestruct), 'selfdestruct is builtin')
})

test('staticAnalysisCommon.isStorageVariableDeclaration', function (t) {
  t.plan(3)
  t.ok(common.isStorageVariableDeclaration(storageVariableNodes.node1), 'struct storage pointer param is storage')
  t.ok(common.isStorageVariableDeclaration(storageVariableNodes.node2), 'struct storage pointer mapping param is storage')
  t.notOk(common.isStorageVariableDeclaration(storageVariableNodes.node3), 'bytes is not storage')
})

test('staticAnalysisCommon.isInteraction', function (t) {
  t.plan(5)
  t.ok(common.isInteraction(lowlevelCall.sendAst), 'send is interaction')
  t.ok(common.isInteraction(lowlevelCall.callAst), 'call is interaction')
  t.ok(common.isInteraction(externalDirect), 'ExternalDirectCall is interaction')
  t.notOk(common.isInteraction(lowlevelCall.delegatecallAst), 'delegatecall is not interaction')
  t.notOk(common.isInteraction(localCall), 'local call is not interaction')
})

test('staticAnalysisCommon.isEffect', function (t) {
  t.plan(5)
  t.ok(common.isEffect(inlineAssembly), 'inline assembly is treated as effect')
  t.ok(common.isEffect(assignment), 'assignment is treated as effect')
  t.ok(common.isEffect(unaryOperation), '++ is treated as effect')
  const node = JSON.parse(JSON.stringify(unaryOperation))
  node.operator = '--'
  t.ok(common.isEffect(node), '-- is treated as effect')
  t.notOk(common.isEffect(externalDirect.expression), 'MemberAccess not treated as effect')
})

test('staticAnalysisCommon.isWriteOnStateVariable', function (t) {
  t.plan(3)
  const node1 = JSON.parse(JSON.stringify(storageVariableNodes.node1))
  const node2 = node1
  const node3 = node1
  node2.name = 'y'
  node3.name = 'xx'
  t.ok(common.isWriteOnStateVariable(inlineAssembly, [node1, node2, node3]), 'inline Assembly is write on state')
  t.notOk(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on non state is not write on state')
  node3.name = 'a' // same as assignment left hand side var name
  t.ok(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on state is write on state')
})

test('staticAnalysisCommon.isStateVariable', function (t) {
  t.plan(3)
  t.ok(common.isStateVariable('c', [storageVariableNodes.node1, storageVariableNodes.node2]), 'is contained')
  t.ok(common.isStateVariable('c', [storageVariableNodes.node2, storageVariableNodes.node1, storageVariableNodes.node1]), 'is contained twice')
  t.notOk(common.isStateVariable('c', [storageVariableNodes.node2, storageVariableNodes.node3]), 'not contained')
})

test('staticAnalysisCommon.isConstantFunction', function (t) {
  t.plan(3)
  t.ok(common.isConstantFunction(functionDefinition), 'should be const func definition')
  functionDefinition.stateMutability =  'view'
  t.ok(common.isConstantFunction(functionDefinition), 'should be const func definition')
  functionDefinition.stateMutability =  'nonpayable'
  t.notOk(common.isConstantFunction(functionDefinition), 'should not be const func definition')
})

test('staticAnalysisCommon.isPlusPlusUnaryOperation', function (t) {
  t.plan(2)
  t.ok(common.isPlusPlusUnaryOperation(unaryOperation), 'should be unary ++')
  const node = JSON.parse(JSON.stringify(unaryOperation))
  node.operator = '--'
  t.notOk(common.isPlusPlusUnaryOperation(node), 'should not be unary ++')
})

test('staticAnalysisCommon.isMinusMinusUnaryOperation', function (t) {
  t.plan(2)
  unaryOperation.operator = '--'
  t.ok(common.isMinusMinusUnaryOperation(unaryOperation), 'should be unary --')
  unaryOperation.operator = '++'
  t.notOk(common.isMinusMinusUnaryOperation(unaryOperation), 'should not be unary --')
})

test('staticAnalysisCommon.isFullyImplementedContract', function (t) {
  t.plan(2)
  t.ok(common.isFullyImplementedContract(contractDefinition), 'should be fully implemented contract')
  const node = JSON.parse(JSON.stringify(contractDefinition))
  node.fullyImplemented = false
  t.notOk(common.isFullyImplementedContract(node), 'should not be fully implemented contract')
})

test('staticAnalysisCommon.isCallToNonConstLocalFunction', function (t) {
  t.plan(2)
  t.ok(common.isCallToNonConstLocalFunction(localCall), 'should be call to non const Local func')
  const node = JSON.parse(JSON.stringify(localCall))
  node.expression.typeDescriptions.typeString = 'function (struct Ballot.Voter storage pointer) view payable (uint256)'
  t.notok(common.isCallToNonConstLocalFunction(node), 'should no longer be call to non const Local func')
})

test('staticAnalysisCommon.isExternalDirectCall', function (t) {
  t.plan(5)
  t.notOk(common.isThisLocalCall(externalDirect), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(externalDirect), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(externalDirect), 'is now used should not work')
  t.ok(common.isExternalDirectCall(externalDirect), 'c.f() should be external direct call')
  t.notOk(common.isExternalDirectCall(thisLocalCall.expression), 'this local call is not an external call')
})

test('staticAnalysisCommon.isNowAccess', function (t) {
  t.plan(1)
  t.ok(common.isNowAccess(nowAst), 'is now used should work')
})

test('staticAnalysisCommon.isBlockTimestampAccess', function (t) {
  t.plan(3)
  t.notOk(common.isThisLocalCall(blockTimestamp), 'is this.local_method() used should not work')
  t.ok(common.isBlockTimestampAccess(blockTimestamp), 'is block.timestamp used should work')
  t.notOk(common.isNowAccess(blockTimestamp), 'is now used should not work')
})

test('staticAnalysisCommon.isBlockBlockhashAccess', function (t) {
  t.plan(2)
  t.ok(common.isBlockBlockHashAccess(blockHashAccess), 'blockhash should work')
  t.notOk(common.isNowAccess(blockHashAccess.expression), 'is now used should not work')
})

test('staticAnalysisCommon.isThisLocalCall', function (t) {
  t.plan(2)
  t.ok(common.isThisLocalCall(thisLocalCall.expression), 'is this.local_method() used should work')
  t.notOk(common.isBlockTimestampAccess(thisLocalCall.expression), 'is block.timestamp used should not work')
})

test('staticAnalysisCommon.isSuperLocalCall', function (t) {
  t.plan(3)
  t.ok(common.isSuperLocalCall(superLocal.expression), 'is super.local_method() used should work')
  t.notOk(common.isThisLocalCall(superLocal.expression), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(superLocal.expression), 'is block.timestamp used should not work')
})

test('staticAnalysisCommon.isLibraryCall', function (t) {
  t.plan(4)
  t.ok(common.isLibraryCall(libCall.expression), 'is lib call should not work')
  t.notOk(common.isSuperLocalCall(libCall.expression), 'is super.local_method() used should not work')
  t.notOk(common.isThisLocalCall(libCall.expression), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(libCall.expression), 'is block.timestamp used should not work')
})

test('staticAnalysisCommon.isLocalCall', function (t) {
  t.plan(1)
  t.ok(common.isLocalCall(localCall), 'isLocalCall')
})

test('staticAnalysisCommon.isLowLevelCall', function (t) {
  t.plan(3)
  t.ok(common.isLLSend(lowlevelCall.sendAst.expression) && common.isLowLevelCall(lowlevelCall.sendAst.expression), 'send is llc should work')
  t.ok(common.isLLCall(lowlevelCall.callAst.expression) && common.isLowLevelCall(lowlevelCall.callAst.expression), 'call is llc should work')
  t.ok(common.isLLDelegatecall(lowlevelCall.delegatecallAst) && common.isLowLevelCall(lowlevelCall.delegatecallAst), 'delegatecall is llc should work')
})

test('staticAnalysisCommon: Call of parameter function', function (t) {
  t.plan(3)
  t.ok(common.isLocalCall(parameterFunction), 'is not LocalCall')
  t.equals(common.getFunctionCallType(parameterFunction), 'function (uint256,uint256)', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(parameterFunction), 'uint256,uint256', 'Extracts param right type')
})

test('staticAnalysisCommon: function call with of function with function parameter', function (t) {
  t.plan(2)
  t.equals(common.getFunctionCallType(parameterFunctionCall), 'function (function (uint256) pure returns (uint256)) pure returns (uint256)', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(parameterFunctionCall), 'function (uint256) pure returns (uint256)', 'Extracts param right type')
})

test('staticAnalysisCommon: require call', function (t) {
  t.plan(3)
  t.equals(common.isRequireCall(requireCall), true)
  t.equals(common.getFunctionCallType(requireCall), 'function (bool) pure', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(requireCall), 'bool', 'Extracts param right type')
})

test('staticAnalysisCommon: isDeleteOfDynamicArray', function (t) {
  t.plan(2)
  t.ok(common.isDeleteOfDynamicArray(dynamicDeleteUnaryOp), 'is dynamic array deletion')
  t.ok(common.isDynamicArrayAccess(dynamicDeleteUnaryOp.subExpression), 'Extracts right type')
})

test('staticAnalysisCommon: isAbiNamespaceCall', function (t) {
  t.plan(8)
  t.equals(common.isAbiNamespaceCall(abiNamespaceCallNodes.encode), true, 'encode abi')
  t.equals(common.isAbiNamespaceCall(abiNamespaceCallNodes.encodePacked), true, 'encodePacked abi')
  t.equals(common.isAbiNamespaceCall(abiNamespaceCallNodes.encodeWithSelector), true, 'encodeWithSelector abi')
  t.equals(common.isAbiNamespaceCall(abiNamespaceCallNodes.encodeWithSignature), true, 'encodeWithSignature abi')

  t.equals(common.isBuiltinFunctionCall(abiNamespaceCallNodes.encode), true, 'encode Builtin')
  t.equals(common.isBuiltinFunctionCall(abiNamespaceCallNodes.encodePacked), true, 'encodePacked Builtin')
  t.equals(common.isBuiltinFunctionCall(abiNamespaceCallNodes.encodeWithSelector), true, 'encodeWithSelector Builtin')
  t.equals(common.isBuiltinFunctionCall(abiNamespaceCallNodes.encodeWithSignature), true, 'encodeWithSignature Builtin')
})
