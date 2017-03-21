var test = require('tape')

var common = require('../../babelify-src/app/staticanalysis/modules/staticAnalysisCommon')
var utils = require('../../babelify-src/app/utils')

test('staticAnalysisCommon.helpers.buildFunctionSignature', function (t) {
  t.plan(7)

  t.equal(common.helpers.buildFunctionSignature([common.basicTypes.UINT, common.basicTypes.ADDRESS], [common.basicTypes.BOOL], false),
    'function (uint256,address) returns (bool)',
    'two params and return value without payable')

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

test('staticAnalysisCommon.helpers.name', function (t) {
  t.plan(9)
  var node = { attributes: { value: 'now' } }
  var node2 = { attributes: { member_name: 'call' } }

  t.ok(common.helpers.name(node, 'now'), 'should work for values')
  t.ok(common.helpers.name(node2, 'call'), 'should work for member_name')
  t.ok(common.helpers.name(node2, '.all'), 'regex should work')

  lowlevelAccessersCommon(t, common.helpers.name, node)
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
  t.ok(common.helpers.expressionType(node2, utils.escapeRegExp(common.basicFunctionTypes.CALL)), 'should work for funcall')
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
  t.notOk(common.helpers.nrOfChildren(node3, 0), 'should not work without children arr')

  lowlevelAccessersCommon(t, common.helpers.nrOfChildren, node)
})

function lowlevelAccessersCommon (t, f, someNode) {
  t.ok(f(someNode), 'always ok if type is undefinded')
  t.ok(f(someNode, undefined), 'always ok if name is undefinded 2')
  t.notOk(f(null, undefined), 'false on no node')
  t.notOk(f(null, 'call'), 'false on no node')
  t.notOk(f(undefined, null), 'false on no node')
  t.notOk(f(), 'false on no params')
}

test('staticAnalysisCommon.helpers.isLowLevelCall', function (t) {
  t.plan(4)
  var sendAst = { name: 'MemberAccess', children: [{attributes: { value: 'd', type: 'address' }}], attributes: { value: 'send', type: 'function (uint256) returns (bool)' } }
  var callAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var callcodeAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'callcode', type: 'function () payable returns (bool)' } }
  var delegatecallAst = { name: 'MemberAccess', children: [{attributes: { value: 'g', type: 'address' }}], attributes: { member_name: 'delegatecall', type: 'function () returns (bool)' } }

  t.ok(common.isLowLevelSendInst(sendAst) && common.isLowLevelCall(sendAst), 'send is llc should work')
  t.ok(common.isLowLevelCallInst(callAst) && common.isLowLevelCall(callAst), 'call is llc should work')
  t.ok(common.isLowLevelCallcodeInst(callcodeAst) && common.isLowLevelCall(callcodeAst), 'callcode is llc should work')
  t.ok(common.isLowLevelDelegatecallInst(delegatecallAst) && common.isLowLevelCall(delegatecallAst), 'delegatecall is llc should work')
})

test('staticAnalysisCommon.helpers.isThisLocalCall', function (t) {
  t.plan(3)
  var node = { name: 'MemberAccess', children: [{attributes: { value: 'this', type: 'contract test' }}], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  t.ok(common.isThisLocalCall(node), 'is this.local_method() used should work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.helpers.isBlockTimestampAccess', function (t) {
  t.plan(3)
  var node = { name: 'MemberAccess', children: [{attributes: { value: 'block', type: 'block' }}], attributes: { value: 'timestamp', type: 'uint256' } }
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.ok(common.isBlockTimestampAccess(node), 'is block.timestamp used should work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.helpers.isNowAccess', function (t) {
  t.plan(3)
  var node = { name: 'Identifier', attributes: { value: 'now', type: 'uint256' } }
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.ok(common.isNowAccess(node), 'is now used should work')
})
