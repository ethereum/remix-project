import { default as test} from "tape"
import * as common from '../../dist/src/solidity-analyzer/modules/staticAnalysisCommon'
const { localCall, thisLocalCall, libCall, externalDirect, superLocal, assignment,
    inlineAssembly, forLoopNode, whileLoopNode, doWhileLoopNode, stateVariableContractNode,
    functionDefinition, fullyQualifiedFunctionDefinition, selfdestruct, storageVariableNodes,
    lowlevelCall, parameterFunction, parameterFunctionCall, inheritance, blockHashAccess } = require('./astBlocks')

function escapeRegExp (str) {
  return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&')
}

test('staticAnalysisCommon.helpers.buildFunctionSignature', function (t) {
  t.plan(9)

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
    'function () payable returns (bool)',
    'check fixed call type')

  t.equal(common.lowLevelCallTypes.CALLCODE.type,
    'function () payable returns (bool)',
    'check fixed callcode type')

  t.equal(common.lowLevelCallTypes.SEND.type,
    'function (uint256) returns (bool)',
    'check fixed send type')

  t.equal(common.lowLevelCallTypes.DELEGATECALL.type,
    'function () returns (bool)',
    'check fixed call type')
})

// #################### Node Identification Primitives

test('staticAnalysisCommon.helpers.name', function (t) {
  t.plan(9)
  var node = { attributes: { value: 'now' } }
  var node2 = { attributes: { member_name: 'call' } }

  t.ok(common.helpers.memName(node, 'now'), 'should work for values')
  t.ok(common.helpers.memName(node2, 'call'), 'should work for member_name')
  t.ok(common.helpers.memName(node2, '.all'), 'regex should work')

  lowlevelAccessersCommon(t, common.helpers.memName, node)
})

test('staticAnalysisCommon.helpers.operator', function (t) {
  t.plan(10)
  var node = { attributes: { operator: '++' } }
  var node2 = { attributes: { operator: '+++' } }

  var escapedPP = escapeRegExp('++')
  var escapedPPExact = `^${escapedPP}$`

  t.ok(common.helpers.operator(node, escapedPPExact), 'should work for ++')
  t.notOk(common.helpers.operator(node2, escapedPPExact), 'should not work for +++')
  t.ok(common.helpers.operator(node, escapedPP), 'should work for ++')
  t.ok(common.helpers.operator(node2, escapedPP), 'should work for +++')

  lowlevelAccessersCommon(t, common.helpers.operator, node)
})

test('staticAnalysisCommon.helpers.nodeType', function (t) {
  t.plan(9)
  var node = { name: 'Identifier', attributes: { name: 'now' } }
  var node2 = { name: 'FunctionCall', attributes: { member_name: 'call' } }

  t.ok(common.helpers.nodeType(node, common.nodeTypes.IDENTIFIER), 'should work for ident')
  t.ok(common.helpers.nodeType(node2, common.nodeTypes.FUNCTIONCALL), 'should work for funcall')
  t.ok(common.helpers.nodeType(node2, '^F'), 'regex should work for funcall')

  lowlevelAccessersCommon(t, common.helpers.nodeType, node)
})

test('staticAnalysisCommon.helpers.expressionType', function (t) {
  t.plan(9)
  var node = { name: 'Identifier', attributes: { value: 'now', type: 'uint256' } }
  var node2 = { name: 'FunctionCall', attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }

  t.ok(common.helpers.expressionType(node, common.basicTypes.UINT), 'should work for ident')
  t.ok(common.helpers.expressionType(node2, escapeRegExp(common.basicFunctionTypes.CALL)), 'should work for funcall')
  t.ok(common.helpers.expressionType(node2, '^function \\('), 'regex should work')

  lowlevelAccessersCommon(t, common.helpers.expressionType, node)
})

test('staticAnalysisCommon.helpers.nrOfChildren', function (t) {
  t.plan(10)
  var node = { name: 'Identifier', children: ['a', 'b'], attributes: { value: 'now', type: 'uint256' } }
  var node2 = { name: 'FunctionCall', children: [], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var node3 = { name: 'FunctionCall', attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }

  t.ok(common.helpers.nrOfChildren(node, 2), 'should work for 2 children')
  t.notOk(common.helpers.nrOfChildren(node, '1+2'), 'regex should not work')
  t.ok(common.helpers.nrOfChildren(node2, 0), 'should work for 0 children')
  t.ok(common.helpers.nrOfChildren(node3, 0), 'should work without children arr')

  lowlevelAccessersCommon(t, common.helpers.nrOfChildren, node)
})

test('staticAnalysisCommon.helpers.minNrOfChildren', function (t) {
  t.plan(13)
  var node = { name: 'Identifier', children: ['a', 'b'], attributes: { value: 'now', type: 'uint256' } }
  var node2 = { name: 'FunctionCall', children: [], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var node3 = { name: 'FunctionCall', attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }

  t.ok(common.helpers.minNrOfChildren(node, 2), 'should work for 2 children')
  t.ok(common.helpers.minNrOfChildren(node, 1), 'should work for 1 children')
  t.ok(common.helpers.minNrOfChildren(node, 0), 'should work for 0 children')
  t.notOk(common.helpers.minNrOfChildren(node, 3), 'has less than 3 children')
  t.notOk(common.helpers.minNrOfChildren(node, '1+2'), 'regex should not work')
  t.ok(common.helpers.minNrOfChildren(node2, 0), 'should work for 0 children')
  t.ok(common.helpers.minNrOfChildren(node3, 0), 'should work without children arr')

  lowlevelAccessersCommon(t, common.helpers.minNrOfChildren, node)
})

function lowlevelAccessersCommon (t, f, someNode) {
  t.ok(f(someNode), 'always ok if type is undefinded')
  t.ok(f(someNode, undefined), 'always ok if name is undefinded 2')
  t.notOk(f(null, undefined), 'false on no node')
  t.notOk(f(null, 'call'), 'false on no node')
  t.notOk(f(undefined, null), 'false on no node')
  t.notOk(f(), 'false on no params')
}

// #################### Trivial Getter Test

test('staticAnalysisCommon.getType', function (t) {
  t.plan(3)
  var node = { name: 'Identifier', children: ['a', 'b'], attributes: { value: 'now', type: 'uint256' } }
  var node2 = { name: 'FunctionCall', children: [], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var node3 = { name: 'FunctionCall', attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }

  t.ok(common.getType(node) === 'uint256', 'gettype should work for different nodes')
  t.ok(common.getType(node2) === 'function () payable returns (bool)', 'gettype should work for different nodes')
  t.ok(common.getType(node3) === 'function () payable returns (bool)', 'gettype should work for different nodes')
})

// #################### Complex Getter Test

test('staticAnalysisCommon.getFunctionCallType', function (t) {
  t.plan(5)
  t.equal(common.getFunctionCallType(libCall), 'function (struct Set.Data storage pointer,uint256) returns (bool)', 'this lib call returns correct type')
  t.equal(common.getFunctionCallType(thisLocalCall), 'function (bytes32,address) returns (bool)', 'this local call returns correct type')
  t.equal(common.getFunctionCallType(externalDirect), 'function () payable external returns (uint256)', 'external direct call returns correct type')
  t.equal(common.getFunctionCallType(localCall), 'function (struct Ballot.Voter storage pointer)', 'local call returns correct type')
  t.throws(() => common.getFunctionCallType({ name: 'MemberAccess' }), Error, 'throws on wrong type')
})

test('staticAnalysisCommon.getEffectedVariableName', function (t) {
  t.plan(3)
  t.throws(() => common.getEffectedVariableName(inlineAssembly), Error, 'staticAnalysisCommon.js: not an effect Node or inline assembly, get from inline assembly should throw')
  t.ok(common.getEffectedVariableName(assignment) === 'c', 'get right name for assignment')
  t.throws(() => common.getEffectedVariableName({ name: 'MemberAccess' }), Error, 'should throw on all other nodes')
})

test('staticAnalysisCommon.getLocalCallName', function (t) {
  t.plan(3)
  t.ok(common.getLocalCallName(localCall) === 'bli', 'getLocal call name from node')
  t.throws(() => common.getLocalCallName(externalDirect), Error, 'throws on other nodes')
  t.throws(() => common.getLocalCallName(thisLocalCall), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getThisLocalCallName', function (t) {
  t.plan(3)
  t.ok(common.getThisLocalCallName(thisLocalCall) === 'b', 'get this Local call name from node')
  t.throws(() => common.getThisLocalCallName(externalDirect), Error, 'throws on other nodes')
  t.throws(() => common.getThisLocalCallName(localCall), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getSuperLocalCallName', function (t) {
  t.plan(4)
  t.equal(common.getSuperLocalCallName(superLocal), 'duper', 'get local name from super local call')
  t.throws(() => common.getSuperLocalCallName(thisLocalCall), 'throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(externalDirect), 'throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(localCall), 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallContractName', function (t) {
  t.plan(3)
  t.ok(common.getExternalDirectCallContractName(externalDirect) === 'InfoFeed', 'external direct call contract name from node')
  t.throws(() => common.getExternalDirectCallContractName(thisLocalCall), Error, 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallContractName(localCall), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getThisLocalCallContractName', function (t) {
  t.plan(3)
  t.ok(common.getThisLocalCallContractName(thisLocalCall) === 'test', 'this local call contract name from node')
  t.throws(() => common.getThisLocalCallContractName(localCall), Error, 'throws on other nodes')
  t.throws(() => common.getThisLocalCallContractName(externalDirect), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallMemberName', function (t) {
  t.plan(3)
  t.ok(common.getExternalDirectCallMemberName(externalDirect) === 'info', 'external direct call name from node')
  t.throws(() => common.getExternalDirectCallMemberName(thisLocalCall), Error, 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallMemberName(localCall), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getContractName', function (t) {
  t.plan(2)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  t.ok(common.getContractName(contract) === 'baz', 'returns right contract name')
  t.throws(() => common.getContractName({ name: 'InheritanceSpecifier' }), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionDefinitionName', function (t) {
  t.plan(2)
  var func = { name: 'FunctionDefinition', attributes: { name: 'foo' } }
  t.ok(common.getFunctionDefinitionName(func) === 'foo', 'returns right contract name')
  t.throws(() => common.getFunctionDefinitionName({ name: 'InlineAssembly' }), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getInheritsFromName', function (t) {
  t.plan(2)
  t.ok(common.getInheritsFromName(inheritance) === 'r', 'returns right contract name')
  t.throws(() => common.getInheritsFromName({ name: 'ElementaryTypeName' }), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getDeclaredVariableName', function (t) {
  t.plan(2)
  t.ok(common.getDeclaredVariableName(storageVariableNodes.node1) === 'x', 'extract right variable name')
  let node1 = JSON.parse(JSON.stringify(storageVariableNodes))
  node1.node1.name = 'FunctionCall'
  t.throws(() => common.getDeclaredVariableName(node1) === 'x', Error, 'throw if wrong node')
})

test('staticAnalysisCommon.getStateVariableDeclarationsFormContractNode', function (t) {
  t.plan(4)
  var res = common.getStateVariableDeclarationsFormContractNode(stateVariableContractNode).map(common.getDeclaredVariableName)
  t.ok(res[0] === 'chairperson', 'var 1 should be ')
  t.ok(res[1] === 'voters', 'var 2 should be ')
  t.ok(res[2] === 'proposals', 'var 3 should be ')
  t.ok(res[3] === undefined, 'var 4 should be  undefined')
})

test('staticAnalysisCommon.getFunctionOrModifierDefinitionParameterPart', function (t) {
  t.plan(2)
  t.ok(common.helpers.nodeType(common.getFunctionOrModifierDefinitionParameterPart(functionDefinition), 'ParameterList'), 'should return a parameterList')
  t.throws(() => common.getFunctionOrModifierDefinitionParameterPart({ name: 'SourceUnit' }), Error, 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionCallTypeParameterType', function (t) {
  t.plan(4)
  t.ok(common.getFunctionCallTypeParameterType(thisLocalCall) === 'bytes32,address', 'this local call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(externalDirect) === '', 'external direct call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(localCall) === 'struct Ballot.Voter storage pointer', 'local call returns correct type')
  t.throws(() => common.getFunctionCallTypeParameterType({ name: 'MemberAccess' }), Error, 'throws on wrong type')
})

test('staticAnalysisCommon.getLibraryCallContractName', function (t) {
  t.plan(2)
  t.equal(common.getLibraryCallContractName(libCall), 'Set', 'should return correct contract name')
  t.throws(() => common.getLibraryCallContractName({ name: 'Identifier' }), Error, 'should throw on wrong node')
})

test('staticAnalysisCommon.getLibraryCallMemberName', function (t) {
  t.plan(2)
  t.equal(common.getLibraryCallMemberName(libCall), 'insert', 'should return correct member name')
  t.throws(() => common.getLibraryCallMemberName({ name: 'Identifier' }), Error, 'should throw on wrong node')
})

test('staticAnalysisCommon.getFullQualifiedFunctionCallIdent', function (t) {
  t.plan(4)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  t.ok(common.getFullQualifiedFunctionCallIdent(contract, thisLocalCall) === 'test.b(bytes32,address)', 'this local call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contract, externalDirect) === 'InfoFeed.info()', 'external direct call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contract, localCall) === 'baz.bli(struct Ballot.Voter storage pointer)', 'local call returns correct type')
  t.throws(() => common.getFullQualifiedFunctionCallIdent(contract, { name: 'MemberAccess' }), Error, 'throws on wrong type')
})

test('staticAnalysisCommon.getFullQuallyfiedFuncDefinitionIdent', function (t) {
  t.plan(3)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  t.ok(common.getFullQuallyfiedFuncDefinitionIdent(contract, fullyQualifiedFunctionDefinition, ['uint256', 'bool']) === 'baz.getY(uint256,bool)', 'creates right signature')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent(contract, { name: 'MemberAccess' }, ['uint256', 'bool']), Error, 'throws on wrong nodes')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent({ name: 'FunctionCall' }, fullyQualifiedFunctionDefinition, ['uint256', 'bool']), Error, 'throws on wrong nodes')
})

test('staticAnalysisCommon.getLoopBlockStartIndex', function (t) {
  t.plan(3)
  t.equal(common.getLoopBlockStartIndex(forLoopNode), 3) // 'for' loop
  t.equal(common.getLoopBlockStartIndex(doWhileLoopNode), 1) // 'do-while' loop
  t.equal(common.getLoopBlockStartIndex(whileLoopNode), 1) // 'while' loop
})

// #################### Trivial Node Identification

test('staticAnalysisCommon.isFunctionDefinition', function (t) {
  t.plan(3)
  var node1 = { name: 'FunctionDefinition' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'FunctionDefinitionBLABLA' }

  t.ok(common.isFunctionDefinition(node1), 'is exact match should work')
  t.notOk(common.isFunctionDefinition(node2), 'different node should not work')
  t.notOk(common.isFunctionDefinition(node3), 'substring should not work')
})

test('staticAnalysisCommon.isModifierDefinition', function (t) {
  t.plan(3)
  var node1 = { name: 'ModifierDefinition' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'ModifierDefinitionBLABLA' }

  t.ok(common.isModifierDefinition(node1), 'is exact match should work')
  t.notOk(common.isModifierDefinition(node2), 'different node should not work')
  t.notOk(common.isModifierDefinition(node3), 'substring should not work')
})

test('staticAnalysisCommon.isModifierInvocation', function (t) {
  t.plan(3)
  var node1 = { name: 'ModifierInvocation' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'ModifierInvocationBLABLA' }

  t.ok(common.isModifierInvocation(node1), 'is exact match should work')
  t.notOk(common.isModifierInvocation(node2), 'different node should not work')
  t.notOk(common.isModifierInvocation(node3), 'substring should not work')
})

test('staticAnalysisCommon.isVariableDeclaration', function (t) {
  t.plan(3)
  var node1 = { name: 'VariableDeclaration' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'VariableDeclarationBLABLA' }

  t.ok(common.isVariableDeclaration(node1), 'is exact match should work')
  t.notOk(common.isVariableDeclaration(node2), 'different node should not work')
  t.notOk(common.isVariableDeclaration(node3), 'substring should not work')
})

test('staticAnalysisCommon.isInheritanceSpecifier', function (t) {
  t.plan(3)
  var node1 = { name: 'InheritanceSpecifier' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'InheritanceSpecifierBLABLA' }

  t.ok(common.isInheritanceSpecifier(node1), 'is exact match should work')
  t.notOk(common.isInheritanceSpecifier(node2), 'different node should not work')
  t.notOk(common.isInheritanceSpecifier(node3), 'substring should not work')
})

test('staticAnalysisCommon.isAssignment', function (t) {
  t.plan(3)
  var node1 = { name: 'Assignment' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'AssignmentBLABLA' }

  t.ok(common.isAssignment(node1), 'is exact match should work')
  t.notOk(common.isAssignment(node2), 'different node should not work')
  t.notOk(common.isAssignment(node3), 'substring should not work')
})

test('staticAnalysisCommon.isContractDefinition', function (t) {
  t.plan(3)
  var node1 = { name: 'ContractDefinition' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'ContractDefinitionBLABLA' }

  t.ok(common.isContractDefinition(node1), 'is exact match should work')
  t.notOk(common.isContractDefinition(node2), 'different node should not work')
  t.notOk(common.isContractDefinition(node3), 'substring should not work')
})

test('staticAnalysisCommon.isInlineAssembly', function (t) {
  t.plan(3)
  var node1 = { name: 'InlineAssembly' }
  var node2 = { name: 'MemberAccess' }
  var node3 = { name: 'InlineAssemblyBLABLA' }

  t.ok(common.isInlineAssembly(node1), 'is exact match should work')
  t.notOk(common.isInlineAssembly(node2), 'different node should not work')
  t.notOk(common.isInlineAssembly(node3), 'substring should not work')
})

test('staticAnalysisCommon.isLoop', function (t) {
  t.plan(3)
  t.equal(common.isLoop(forLoopNode), true)
  t.equal(common.isLoop(doWhileLoopNode), true)
  t.equal(common.isLoop(whileLoopNode), true)
})

// #################### Complex Node Identification

test('staticAnalysisCommon.isBuiltinFunctionCall', function (t) {
  t.plan(2)
  t.ok(common.isBuiltinFunctionCall(selfdestruct), 'selfdestruct is builtin')
  t.notOk(common.isBuiltinFunctionCall(localCall), 'local call is not builtin')
})

test('staticAnalysisCommon.isStorageVariableDeclaration', function (t) {
  t.plan(3)
  t.ok(common.isStorageVariableDeclaration(storageVariableNodes.node1), 'struct storage pointer param is storage')
  t.ok(common.isStorageVariableDeclaration(storageVariableNodes.node2), 'struct storage pointer mapping param is storage')
  t.notOk(common.isStorageVariableDeclaration(storageVariableNodes.node3), 'bytes is not storage')
})

test('staticAnalysisCommon.isInteraction', function (t) {
  t.plan(6)
  t.ok(common.isInteraction(lowlevelCall.sendAst), 'send is interaction')
  t.ok(common.isInteraction(lowlevelCall.callAst), 'call is interaction')
  t.ok(common.isInteraction(externalDirect), 'ExternalDirecCall is interaction')
  t.notOk(common.isInteraction(lowlevelCall.callcodeAst), 'callcode is not interaction')
  t.notOk(common.isInteraction(lowlevelCall.delegatecallAst), 'callcode is not interaction')
  t.notOk(common.isInteraction(localCall), 'local call is not interaction')
})

test('staticAnalysisCommon.isEffect', function (t) {
  t.plan(5)
  var unaryOp = { name: 'UnaryOperation', attributes: { operator: '++' } }
  t.ok(common.isEffect(inlineAssembly), 'inline assembly is treated as effect')
  t.ok(common.isEffect(assignment), 'assignment is treated as effect')
  t.ok(common.isEffect(unaryOp), '++ is treated as effect')
  unaryOp.attributes.operator = '--'
  t.ok(common.isEffect(unaryOp), '-- is treated as effect')
  t.notOk(common.isEffect({ name: 'MemberAccess', attributes: { operator: '++' } }), 'MemberAccess not treated as effect')
})

test('staticAnalysisCommon.isWriteOnStateVariable', function (t) {
  t.plan(3)
  let node1 = JSON.parse(JSON.stringify(storageVariableNodes.node1))
  let node2 = node1
  let node3 = node1
  node2.attributes.name = 'y'
  node3.attributes.name = 'xx'
  t.ok(common.isWriteOnStateVariable(inlineAssembly, [node1, node2, node3]), 'inline Assembly is write on state')
  t.notOk(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on non state is not write on state')
  node3.attributes.name = 'c'
  t.ok(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on state is not write on state')
})

test('staticAnalysisCommon.isStateVariable', function (t) {
  t.plan(3)
  t.ok(common.isStateVariable('x', [storageVariableNodes.node1, storageVariableNodes.node2]), 'is contained')
  t.ok(common.isStateVariable('x', [storageVariableNodes.node2, storageVariableNodes.node1, storageVariableNodes.node1]), 'is contained twice')
  t.notOk(common.isStateVariable('x', [storageVariableNodes.node2, storageVariableNodes.node3]), 'not contained')
})

test('staticAnalysisCommon.isConstantFunction', function (t) {
  t.plan(3)
  var node1 = { name: 'FunctionDefinition', attributes: { constant: true, stateMutability: 'view' } }
  var node2 = { name: 'FunctionDefinition', attributes: { constant: false, stateMutability: 'nonpayable' } }
  var node3 = { name: 'MemberAccess', attributes: { constant: true, stateMutability: 'view' } }

  t.ok(common.isConstantFunction(node1), 'should be const func definition')
  t.notOk(common.isConstantFunction(node2), 'should not be const func definition')
  t.notOk(common.isConstantFunction(node3), 'wrong node should not be const func definition')
})

test('staticAnalysisCommon.isPlusPlusUnaryOperation', function (t) {
  t.plan(3)
  var node1 = { name: 'UnaryOperation', attributes: { operator: '++' } }
  var node2 = { name: 'UnaryOperation', attributes: { operator: '--' } }
  var node3 = { name: 'FunctionDefinition', attributes: { operator: '++' } }

  t.ok(common.isPlusPlusUnaryOperation(node1), 'should be unary ++')
  t.notOk(common.isPlusPlusUnaryOperation(node2), 'should not be unary ++')
  t.notOk(common.isPlusPlusUnaryOperation(node3), 'wrong node should not be unary ++')
})

test('staticAnalysisCommon.isMinusMinusUnaryOperation', function (t) {
  t.plan(3)
  var node1 = { name: 'UnaryOperation', attributes: { operator: '--' } }
  var node2 = { name: 'UnaryOperation', attributes: { operator: '++' } }
  var node3 = { name: 'FunctionDefinition', attributes: { operator: '--' } }

  t.ok(common.isMinusMinusUnaryOperation(node1), 'should be unary --')
  t.notOk(common.isMinusMinusUnaryOperation(node2), 'should not be unary --')
  t.notOk(common.isMinusMinusUnaryOperation(node3), 'wrong node should not be unary --')
})

test('staticAnalysisCommon.isFullyImplementedContract', function (t) {
  t.plan(3)
  var node1 = { name: 'ContractDefinition', attributes: { fullyImplemented: true } }
  var node2 = { name: 'ContractDefinition', attributes: { fullyImplemented: false } }
  var node3 = { name: 'FunctionDefinition', attributes: { operator: '--' } }

  t.ok(common.isFullyImplementedContract(node1), 'should be fully implemented contract')
  t.notOk(common.isFullyImplementedContract(node2), 'should not be fully implemented contract')
  t.notOk(common.isFullyImplementedContract(node3), 'wrong node should not be fully implemented contract')
})

test('staticAnalysisCommon.isCallToNonConstLocalFunction', function (t) {
  t.plan(2)
  t.ok(common.isCallToNonConstLocalFunction(localCall), 'should be call to non const Local func')
  localCall.children[0].attributes.type = 'function (struct Ballot.Voter storage pointer) view payable (uint256)'
  t.notok(common.isCallToNonConstLocalFunction(localCall), 'should no longer be call to non const Local func')
})

test('staticAnalysisCommon.isExternalDirectCall', function (t) {
  t.plan(5)
  var node2 = { name: 'MemberAccess', children: [{attributes: { value: 'this', type: 'contract test' }}], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  t.notOk(common.isThisLocalCall(externalDirect), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(externalDirect), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(externalDirect), 'is now used should not work')
  t.ok(common.isExternalDirectCall(externalDirect), 'f.info() should be external direct call')
  t.notOk(common.isExternalDirectCall(node2), 'local call is not an exernal call')
})

test('staticAnalysisCommon.isNowAccess', function (t) {
  t.plan(3)
  var node = { name: 'Identifier', attributes: { value: 'now', type: 'uint256' } }
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.ok(common.isNowAccess(node), 'is now used should work')
})

test('staticAnalysisCommon.isBlockTimestampAccess', function (t) {
  t.plan(3)
  var node = { name: 'MemberAccess', children: [{attributes: { value: 'block', type: 'block' }}], attributes: { value: 'timestamp', type: 'uint256' } }
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.ok(common.isBlockTimestampAccess(node), 'is block.timestamp used should work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.isBlockBlockhashAccess', function (t) {
  t.plan(4)
  t.notOk(common.isThisLocalCall(blockHashAccess), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(blockHashAccess), 'is block.timestamp used should not work')
  t.ok(common.isBlockBlockHashAccess(blockHashAccess), 'blockhash should work') // todo:
  t.notOk(common.isNowAccess(blockHashAccess), 'is now used should not work')
})

test('staticAnalysisCommon.isThisLocalCall', function (t) {
  t.plan(3)
  t.ok(common.isThisLocalCall(thisLocalCall), 'is this.local_method() used should work')
  t.notOk(common.isBlockTimestampAccess(thisLocalCall), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(thisLocalCall), 'is now used should not work')
})

test('staticAnalysisCommon.isSuperLocalCall', function (t) {
  t.plan(4)
  t.ok(common.isSuperLocalCall(superLocal), 'is super.local_method() used should work')
  t.notOk(common.isThisLocalCall(superLocal), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(superLocal), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(superLocal), 'is now used should not work')
})

test('staticAnalysisCommon.isLibraryCall', function (t) {
  t.plan(5)
  t.ok(common.isLibraryCall(libCall), 'is lib call should not work')
  t.notOk(common.isSuperLocalCall(libCall), 'is super.local_method() used should not work')
  t.notOk(common.isThisLocalCall(libCall), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(libCall), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(libCall), 'is now used should not work')
})

test('staticAnalysisCommon.isLocalCall', function (t) {
  t.plan(5)
  t.ok(common.isLocalCall(localCall), 'isLocalCall')
  t.notOk(common.isLowLevelCall(localCall), 'is not low level call')
  t.notOk(common.isExternalDirectCall(localCall), 'is not external direct call')
  t.notOk(common.isEffect(localCall), 'is not effect')
  t.notOk(common.isInteraction(localCall), 'is not interaction')
})

test('staticAnalysisCommon.isLowLevelCall', function (t) {
  t.plan(6)
  t.ok(common.isLowLevelSendInst(lowlevelCall.sendAst) && common.isLowLevelCall(lowlevelCall.sendAst), 'send is llc should work')
  t.ok(common.isLowLevelCallInst(lowlevelCall.callAst) && common.isLowLevelCall(lowlevelCall.callAst), 'call is llc should work')
  t.notOk(common.isLowLevelCallInst(lowlevelCall.callcodeAst), 'callcode is not call')
  t.ok(common.isLowLevelCallcodeInst(lowlevelCall.callcodeAst) && common.isLowLevelCall(lowlevelCall.callcodeAst), 'callcode is llc should work')
  t.notOk(common.isLowLevelCallcodeInst(lowlevelCall.callAst), 'call is not callcode')
  t.ok(common.isLowLevelDelegatecallInst(lowlevelCall.delegatecallAst) && common.isLowLevelCall(lowlevelCall.delegatecallAst), 'delegatecall is llc should work')
})

test('staticAnalysisCommon: Call of parameter function', function (t) {
  t.plan(7)
  t.ok(common.isLocalCall(parameterFunction), 'is not LocalCall')
  t.notOk(common.isThisLocalCall(parameterFunction), 'is not this local call')
  t.notOk(common.isSuperLocalCall(parameterFunction), 'is not super local call')
  t.notOk(common.isExternalDirectCall(parameterFunction), 'is not ExternalDirectCall')
  t.notOk(common.isLibraryCall(parameterFunction), 'is not LibraryCall')

  t.equals(common.getFunctionCallType(parameterFunction), 'function (uint256,uint256) pure returns (uint256)', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(parameterFunction), 'uint256,uint256', 'Extracts param right type')
})

test('staticAnalysisCommon: function call with of function with function parameter', function (t) {
  t.plan(2)
  t.equals(common.getFunctionCallType(parameterFunctionCall), 'function (function (uint256,uint256) pure returns (uint256),uint256,uint256) pure returns (uint256)', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(parameterFunctionCall), 'function (uint256,uint256) pure returns (uint256),uint256,uint256', 'Extracts param right type')
})

test('staticAnalysisCommon: require call', function (t) {
  t.plan(3)
  var node = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'isStructConstructorCall': false, 'lValueRequested': false, 'names': [null], 'type': 'tuple()', 'type_conversion': false}, 'children': [{'attributes': {'argumentTypes': [{'typeIdentifier': 't_bool', 'typeString': 'bool'}, {'typeIdentifier': 't_stringliteral_80efd193f332877914d93edb0b3ef5c6a7eecd00c6251c3fd7f146b60b40e6cd', 'typeString': 'literal_string \'fuu\''}], 'overloadedDeclarations': [90, 91], 'referencedDeclaration': 91, 'type': 'function (bool,string memory) pure', 'value': 'require'}, 'id': 50, 'name': 'Identifier', 'src': '462:7:0'}, {'attributes': {'argumentTypes': null, 'commonType': {'typeIdentifier': 't_address', 'typeString': 'address'}, 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'operator': '==', 'type': 'bool'}, 'children': [{'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'member_name': 'sender', 'referencedDeclaration': null, 'type': 'address'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 87, 'type': 'msg', 'value': 'msg'}, 'id': 51, 'name': 'Identifier', 'src': '470:3:0'}], 'id': 52, 'name': 'MemberAccess', 'src': '470:10:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 10, 'type': 'address', 'value': 'owner'}, 'id': 53, 'name': 'Identifier', 'src': '484:5:0'}], 'id': 54, 'name': 'BinaryOperation', 'src': '470:19:0'}, {'attributes': {'argumentTypes': null, 'hexvalue': '667575', 'isConstant': false, 'isLValue': false, 'isPure': true, 'lValueRequested': false, 'subdenomination': null, 'token': 'string', 'type': 'literal_string \'fuu\'', 'value': 'fuu'}, 'id': 55, 'name': 'Literal', 'src': '491:5:0'}], 'id': 56, 'name': 'FunctionCall', 'src': '462:35:0'}

  t.equals(common.isRequireCall(node), true)
  t.equals(common.getFunctionCallType(node), 'function (bool,string memory) pure', 'Extracts right type')
  t.equals(common.getFunctionCallTypeParameterType(node), 'bool,string memory', 'Extracts param right type')
})

test('staticAnalysisCommon: isDeleteOfDynamicArray', function (t) {
  t.plan(2)
  var node = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'operator': 'delete', 'prefix': true, 'type': 'tuple()'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 4, 'type': 'uint256[] storage ref', 'value': 'users'}, 'id': 58, 'name': 'Identifier', 'src': '514:5:0'}], 'id': 59, 'name': 'UnaryOperation', 'src': '507:12:0'}
  t.equals(common.isDeleteOfDynamicArray(node), true)
  t.equals(common.isDynamicArrayAccess(node.children[0]), true, 'Extracts right type')
})

test('staticAnalysisCommon: isAbiNamespaceCall', function (t) {
  t.plan(8)
  var node1 = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'isStructConstructorCall': false, 'lValueRequested': false, 'names': [null], 'type': 'bytes memory', 'type_conversion': false}, 'children': [{'attributes': {'argumentTypes': [{'typeIdentifier': 't_uint256', 'typeString': 'uint256'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}], 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'member_name': 'encode', 'referencedDeclaration': null, 'type': 'function () pure returns (bytes memory)'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 64, 'type': 'abi', 'value': 'abi'}, 'id': 26, 'name': 'Identifier', 'src': '245: 3:0'}], 'id': 28, 'name': 'MemberAccess', 'src': '245:10:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 7, 'type': 'uint256', 'value': 'a'}, 'id': 29, 'name': 'Identifier', 'src': '256:1:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 15, 'type': 'uint256', 'value': 'b'}, 'id': 30, 'name': 'Identifier', 'src': '258:1:0'}], 'id': 31, 'name': 'FunctionCall', 'src': '245:15:0'}
  var node2 = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'isStructConstructorCall': false, 'lValueRequested': false, 'names': [null], 'type': 'bytes memory', 'type_conversion': false}, 'children': [{'attributes': {'argumentTypes': [{'typeIdentifier': 't_uint256', 'typeString': 'uint256'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}], 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'member_name': 'encodePacked', 'referencedDeclaration': null, 'type': 'function () pure returns (bytes memory)'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 64, 'type': 'abi', 'value': 'abi'}, 'id': 33, 'name': 'Identifier', 'src': '279:3:0'}], 'id': 35, 'name': 'MemberAccess', 'src': '279:16:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 7, 'type': 'uint256', 'value': 'a'}, 'id': 36, 'name': 'Identifier', 'src': '296:1:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 15, 'type': 'uint256', 'value': 'b'}, 'id': 37, 'name': 'Identifier', 'src': '298:1:0'}], 'id': 38, 'name': 'FunctionCall', 'src': '279:21:0'}
  var node3 = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'isStructConstructorCall': false, 'lValueRequested': false, 'names': [null], 'type': 'bytes memory', 'type_conversion': false}, 'children': [{'attributes': {'argumentTypes': [{'typeIdentifier': 't_bytes4', 'typeString': 'bytes4'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}], 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'member_name': 'encodeWithSelector', 'referencedDeclaration': null, 'type': 'function (bytes4) pure returns (bytes memory)'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 64, 'type': 'abi', 'value': 'abi'}, 'id': 40, 'name': 'Identifier', 'src': '319:3:0'}], 'id': 42, 'name': 'MemberAccess', 'src': '319:22:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 19, 'type': 'bytes4', 'value': 'selector'}, 'id': 43, 'name': 'Identifier', 'src': '342:8:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 7, 'type': 'uint256', 'value': 'a'}, 'id': 44, 'name': 'Identifier', 'src': '352:1:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 15, 'type': 'uint256', 'value': 'b'}, 'id': 45, 'name': 'Identifier', 'src': '355:1:0'}], 'id': 46, 'name': 'FunctionCall', 'src': '319:38:0'}
  var node4 = {'attributes': {'argumentTypes': null, 'isConstant': false, 'isLValue': false, 'isPure': false, 'isStructConstructorCall': false, 'lValueRequested': false, 'names': [null], 'type': 'bytes memory', 'type_conversion': false}, 'children': [{'attributes': {'argumentTypes': [{'typeIdentifier': 't_string_memory_ptr', 'typeString': 'string memory'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}, {'typeIdentifier': 't_uint256', 'typeString': 'uint256'}], 'isConstant': false, 'isLValue': false, 'isPure': false, 'lValueRequested': false, 'member_name': 'encodeWithSignature', 'referencedDeclaration': null, 'type': 'function (string memory) pure returns (bytes memory)'}, 'children': [{'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 64, 'type': 'abi', 'value': 'abi'}, 'id': 48, 'name': 'Identifier', 'src': '367:3:0'}], 'id': 50, 'name': 'MemberAccess', 'src': '367:23:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 11, 'type': 'string memory', 'value': 'sig'}, 'id': 51, 'name': 'Identifier', 'src': '391:3:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 7, 'type': 'uint256', 'value': 'a'}, 'id': 52, 'name': 'Identifier', 'src': '396:1:0'}, {'attributes': {'argumentTypes': null, 'overloadedDeclarations': [null], 'referencedDeclaration': 15, 'type': 'uint256', 'value': 'b'}, 'id': 53, 'name': 'Identifier', 'src': '399:1:0'}], 'id': 54, 'name': 'FunctionCall', 'src': '367:34:0'}

  t.equals(common.isAbiNamespaceCall(node1), true, 'encode abi')
  t.equals(common.isAbiNamespaceCall(node2), true, 'encodePacked abi')
  t.equals(common.isAbiNamespaceCall(node3), true, 'encodeWithSelector abi')
  t.equals(common.isAbiNamespaceCall(node4), true, 'encodeWithSignature abi')

  t.equals(common.isBuiltinFunctionCall(node1), true, 'encode Builtin')
  t.equals(common.isBuiltinFunctionCall(node2), true, 'encodePacked Builtin')
  t.equals(common.isBuiltinFunctionCall(node3), true, 'encodeWithSelector Builtin')
  t.equals(common.isBuiltinFunctionCall(node4), true, 'encodeWithSignature Builtin')
})
