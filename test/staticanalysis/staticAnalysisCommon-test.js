var test = require('tape')

var common = require('../../src/app/staticanalysis/modules/staticAnalysisCommon')
var utils = require('../../src/lib/utils')

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

// #################### Node Identification Primitives

test('staticAnalysisCommon.helpers.name', function (t) {
  t.plan(9)
  var node = { attributes: { value: 'now' } }
  var node2 = { attributes: { member_name: 'call' } }

  t.ok(common.helpers.name(node, 'now'), 'should work for values')
  t.ok(common.helpers.name(node2, 'call'), 'should work for member_name')
  t.ok(common.helpers.name(node2, '.all'), 'regex should work')

  lowlevelAccessersCommon(t, common.helpers.name, node)
})

test('staticAnalysisCommon.helpers.operator', function (t) {
  t.plan(10)
  var node = { attributes: { operator: '++' } }
  var node2 = { attributes: { operator: '+++' } }

  var escapedPP = utils.escapeRegExp('++')
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
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  var libCall = {
    'attributes': {
      'member_name': 'insert',
      'type': 'function (struct Set.Data storage pointer,uint256) returns (bool)'
    },
    'children': [
      {
        'attributes': {
          'type': 'type(library Set)',
          'value': 'Set'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  t.equal(common.getFunctionCallType(libCall), 'function (struct Set.Data storage pointer,uint256) returns (bool)', 'this lib call returns correct type')
  t.equal(common.getFunctionCallType(thisLocalCall), 'function (bytes32,address) returns (bool)', 'this local call returns correct type')
  t.equal(common.getFunctionCallType(externalDirect), 'function () payable external returns (uint256)', 'external direct call returns correct type')
  t.equal(common.getFunctionCallType(localCall), 'function (struct Ballot.Voter storage pointer)', 'local call returns correct type')
  t.throws(() => common.getFunctionCallType({ name: 'MemberAccess' }), undefined, 'throws on wrong type')
})

test('staticAnalysisCommon.getEffectedVariableName', function (t) {
  t.plan(3)
  var assignment = {
    'attributes': {
      'operator': '=',
      'type': 'uint256'
    },
    'children': [
      {
        'attributes': {
          'type': 'uint256'
        },
        'children': [
          {
            'attributes': {
              'type': 'mapping(address => uint256)',
              'value': 'c'
            },
            'id': 61,
            'name': 'Identifier',
            'src': '873:1:0'
          },
          {
            'attributes': {
              'member_name': 'sender',
              'type': 'address'
            },
            'children': [
              {
                'attributes': {
                  'type': 'msg',
                  'value': 'msg'
                },
                'id': 62,
                'name': 'Identifier',
                'src': '875:3:0'
              }
            ],
            'id': 63,
            'name': 'MemberAccess',
            'src': '875:10:0'
          }
        ],
        'id': 64,
        'name': 'IndexAccess',
        'src': '873:13:0'
      },
      {
        'attributes': {
          'hexvalue': '30',
          'subdenomination': null,
          'token': null,
          'type': 'int_const 0',
          'value': '0'
        },
        'id': 65,
        'name': 'Literal',
        'src': '889:1:0'
      }
    ],
    'id': 66,
    'name': 'Assignment',
    'src': '873:17:0'
  }
  var inlineAssembly = {
    'children': [
    ],
    'id': 21,
    'name': 'InlineAssembly',
    'src': '809:41:0'
  }
  t.throws(() => common.getEffectedVariableName(inlineAssembly), 'staticAnalysisCommon.js: not an effect Node or inline assembly', 'get from inline assembly should throw')
  t.ok(common.getEffectedVariableName(assignment) === 'c', 'get right name for assignment')
  t.throws(() => common.getEffectedVariableName({ name: 'MemberAccess' }), undefined, 'should throw on all other nodes')
})

test('staticAnalysisCommon.getLocalCallName', function (t) {
  t.plan(3)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.ok(common.getLocalCallName(localCall) === 'bli', 'getLocal call name from node')
  t.throws(() => common.getLocalCallName(externalDirect), undefined, 'throws on other nodes')
  t.throws(() => common.getLocalCallName(thisLocalCall), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getThisLocalCallName', function (t) {
  t.plan(3)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.ok(common.getThisLocalCallName(thisLocalCall) === 'b', 'get this Local call name from node')
  t.throws(() => common.getThisLocalCallName(externalDirect), undefined, 'throws on other nodes')
  t.throws(() => common.getThisLocalCallName(localCall), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getSuperLocalCallName', function (t) {
  t.plan(4)
  var superLocal = {
    'attributes': {
      'member_name': 'duper',
      'type': 'function ()'
    },
    'children': [
      {
        'attributes': {
          'type': 'contract super a',
          'value': 'super'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.equal(common.getSuperLocalCallName(superLocal), 'duper', 'get local name from super local call')
  t.throws(() => common.getSuperLocalCallName(thisLocalCall), 'throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(externalDirect), undefined, 'throws on other nodes')
  t.throws(() => common.getSuperLocalCallName(localCall), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallContractName', function (t) {
  t.plan(3)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }

  t.ok(common.getExternalDirectCallContractName(externalDirect) === 'InfoFeed', 'external direct call contract name from node')
  t.throws(() => common.getExternalDirectCallContractName(thisLocalCall), undefined, 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallContractName(localCall), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getThisLocalCallContractName', function (t) {
  t.plan(3)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.ok(common.getThisLocalCallContractName(thisLocalCall) === 'test', 'this local call contract name from node')
  t.throws(() => common.getThisLocalCallContractName(localCall), undefined, 'throws on other nodes')
  t.throws(() => common.getThisLocalCallContractName(externalDirect), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getExternalDirectCallMemberName', function (t) {
  t.plan(3)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.ok(common.getExternalDirectCallMemberName(externalDirect) === 'info', 'external direct call name from node')
  t.throws(() => common.getExternalDirectCallMemberName(thisLocalCall), undefined, 'throws on other nodes')
  t.throws(() => common.getExternalDirectCallMemberName(localCall), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getContractName', function (t) {
  t.plan(2)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  t.ok(common.getContractName(contract) === 'baz', 'returns right contract name')
  t.throws(() => common.getContractName({ name: 'InheritanceSpecifier' }), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionDefinitionName', function (t) {
  t.plan(2)
  var func = { name: 'FunctionDefinition', attributes: { name: 'foo' } }
  t.ok(common.getFunctionDefinitionName(func) === 'foo', 'returns right contract name')
  t.throws(() => common.getFunctionDefinitionName({ name: 'InlineAssembly' }), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getInheritsFromName', function (t) {
  t.plan(2)
  var inh = {
    'children': [
      {
        'attributes': {
          'name': 'r'
        },
        'id': 7,
        'name': 'UserDefinedTypeName',
        'src': '84:1:0'
      }
    ],
    'id': 8,
    'name': 'InheritanceSpecifier',
    'src': '84:1:0'
  }
  t.ok(common.getInheritsFromName(inh) === 'r', 'returns right contract name')
  t.throws(() => common.getInheritsFromName({ name: 'ElementaryTypeName' }), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getDeclaredVariableName', function (t) {
  t.plan(2)
  var node1 = {
    'attributes': {
      'name': 'x',
      'type': 'struct Ballot.Voter storage pointer'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'id': 43,
        'name': 'UserDefinedTypeName',
        'src': '604:5:0'
      }
    ],
    'id': 44,
    'name': 'VariableDeclaration',
    'src': '604:15:0'
  }
  t.ok(common.getDeclaredVariableName(node1) === 'x', 'extract right variable name')
  node1.name = 'FunctionCall'
  t.throws(() => common.getDeclaredVariableName(node1) === 'x', undefined, 'throw if wrong node')
})

test('staticAnalysisCommon.getStateVariableDeclarationsFormContractNode', function (t) {
  t.plan(4)
  var contract = {
    'attributes': {
      'fullyImplemented': true,
      'isLibrary': false,
      'linearizedBaseContracts': [
        274
      ],
      'name': 'Ballot'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'children': [],
        'name': 'StructDefinition'
      },
      {
        'attributes': {
          'name': 'Proposal'
        },
        'children': [],
        'name': 'StructDefinition'
      },
      {
        'attributes': {
          'name': 'chairperson',
          'type': 'address'
        },
        'children': [
          {
            'attributes': {
              'name': 'address'
            },
            'name': 'ElementaryTypeName'
          }
        ],
        'name': 'VariableDeclaration'
      },
      {
        'attributes': {
          'name': 'voters',
          'type': 'mapping(address => struct Ballot.Voter storage ref)'
        },
        'children': [
          {
            'children': [
              {
                'attributes': {
                  'name': 'address'
                },
                'name': 'ElementaryTypeName'
              },
              {
                'attributes': {
                  'name': 'Voter'
                },
                'name': 'UserDefinedTypeName'
              }
            ],
            'name': 'Mapping'
          }
        ],
        'name': 'VariableDeclaration'
      },
      {
        'attributes': {
          'name': 'proposals',
          'type': 'struct Ballot.Proposal storage ref[] storage ref'
        },
        'children': [
          {
            'children': [
              {
                'attributes': {
                  'name': 'Proposal'
                },
                'name': 'UserDefinedTypeName'
              }
            ],
            'name': 'ArrayTypeName'
          }
        ],
        'name': 'VariableDeclaration'
      },
      {
        'attributes': {
          'constant': false,
          'name': 'Ballot',
          'payable': false,
          'visibility': 'public'
        },
        'children': [],
        'name': 'FunctionDefinition'
      },
      {
        'attributes': {
          'constant': false,
          'name': 'giveRightToVote',
          'payable': false,
          'visibility': 'public'
        },
        'children': [],
        'name': 'FunctionDefinition'
      }
    ],
    'name': 'ContractDefinition'
  }
  var res = common.getStateVariableDeclarationsFormContractNode(contract).map(common.getDeclaredVariableName)

  t.ok(res[0] === 'chairperson', 'var 1 should be ')
  t.ok(res[1] === 'voters', 'var 2 should be ')
  t.ok(res[2] === 'proposals', 'var 3 should be ')
  t.ok(res[3] === undefined, 'var 4 should be  undefined')
})

test('staticAnalysisCommon.getFunctionOrModifierDefinitionParameterPart', function (t) {
  t.plan(2)
  var funDef = {
    'attributes': {
      'constant': true,
      'name': 'winnerName',
      'payable': false,
      'visibility': 'public'
    },
    'children': [
      {
        'children': [
        ],
        'name': 'ParameterList'
      },
      {
        'children': [],
        'name': 'ParameterList'
      },
      {
        'children': [],
        'name': 'Block'
      }
    ],
    'name': 'FunctionDefinition'
  }
  t.ok(common.helpers.nodeType(common.getFunctionOrModifierDefinitionParameterPart(funDef), 'ParameterList'), 'should return a parameterList')
  t.throws(() => common.getFunctionOrModifierDefinitionParameterPart({ name: 'SourceUnit' }), undefined, 'throws on other nodes')
})

test('staticAnalysisCommon.getFunctionCallTypeParameterType', function (t) {
  t.plan(4)
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  t.ok(common.getFunctionCallTypeParameterType(thisLocalCall) === 'bytes32,address', 'this local call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(externalDirect) === '', 'external direct call returns correct type')
  t.ok(common.getFunctionCallTypeParameterType(localCall) === 'struct Ballot.Voter storage pointer', 'local call returns correct type')
  t.throws(() => common.getFunctionCallTypeParameterType({ name: 'MemberAccess' }), undefined, 'throws on wrong type')
})

test('staticAnalysisCommon.getLibraryCallContractName', function (t) {
  t.plan(2)
  var node = {
    'attributes': {
      'member_name': 'insert',
      'type': 'function (struct Set.Data storage pointer,uint256) returns (bool)'
    },
    'children': [
      {
        'attributes': {
          'type': 'type(library Set)',
          'value': 'Set'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  t.equal(common.getLibraryCallContractName(node), 'Set', 'should return correct contract name')
  t.throws(() => common.getLibraryCallContractName({ name: 'Identifier' }), undefined, 'should throw on wrong node')
})

test('staticAnalysisCommon.getLibraryCallMemberName', function (t) {
  t.plan(2)
  var node = {
    'attributes': {
      'member_name': 'insert',
      'type': 'function (struct Set.Data storage pointer,uint256) returns (bool)'
    },
    'children': [
      {
        'attributes': {
          'type': 'type(library Set)',
          'value': 'Set'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  t.equal(common.getLibraryCallMemberName(node), 'insert', 'should return correct member name')
  t.throws(() => common.getLibraryCallMemberName({ name: 'Identifier' }), undefined, 'should throw on wrong node')
})

test('staticAnalysisCommon.getFullQualifiedFunctionCallIdent', function (t) {
  t.plan(4)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }
  var thisLocalCall = { name: 'MemberAccess', children: [ { attributes: { value: 'this', type: 'contract test' }, name: 'Identifier' } ], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  var externalDirect = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }

  t.ok(common.getFullQualifiedFunctionCallIdent(contract, thisLocalCall) === 'test.b(bytes32,address)', 'this local call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contract, externalDirect) === 'InfoFeed.info()', 'external direct call returns correct type')
  t.ok(common.getFullQualifiedFunctionCallIdent(contract, localCall) === 'baz.bli(struct Ballot.Voter storage pointer)', 'local call returns correct type')
  t.throws(() => common.getFullQualifiedFunctionCallIdent(contract, { name: 'MemberAccess' }), undefined, 'throws on wrong type')
})

test('staticAnalysisCommon.getFullQuallyfiedFuncDefinitionIdent', function (t) {
  t.plan(3)
  var contract = { name: 'ContractDefinition', attributes: { name: 'baz' } }
  var funDef = {
    'attributes': {
      'constant': false,
      'name': 'getY',
      'payable': false,
      'visibility': 'public'
    },
    'children': [
      {
        'children': [
          {
            'attributes': {
              'name': 'z',
              'type': 'uint256'
            },
            'children': [
              {
                'attributes': {
                  'name': 'uint'
                },
                'name': 'ElementaryTypeName'
              }
            ],
            'name': 'VariableDeclaration'
          },
          {
            'attributes': {
              'name': 'r',
              'type': 'bool'
            },
            'children': [
              {
                'attributes': {
                  'name': 'bool'
                },
                'name': 'ElementaryTypeName'
              }
            ],
            'name': 'VariableDeclaration'
          }
        ],
        'name': 'ParameterList'
      },
      {
        'children': [
          {
            'attributes': {
              'name': '',
              'type': 'uint256'
            },
            'children': [
              {
                'attributes': {
                  'name': 'uint'
                },
                'id': 34,
                'name': 'ElementaryTypeName',
                'src': '285:4:0'
              }
            ],
            'id': 35,
            'name': 'VariableDeclaration',
            'src': '285:4:0'
          }
        ],
        'name': 'ParameterList'
      },
      {
        'children': [],
        'name': 'Block'
      }
    ],
    'name': 'FunctionDefinition'
  }
  t.ok(common.getFullQuallyfiedFuncDefinitionIdent(contract, funDef, ['uint256', 'bool']) === 'baz.getY(uint256,bool)', 'creates right signature')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent(contract, { name: 'MemberAccess' }, ['uint256', 'bool']), undefined, 'throws on wrong nodes')
  t.throws(() => common.getFullQuallyfiedFuncDefinitionIdent({ name: 'FunctionCall' }, funDef, ['uint256', 'bool']), undefined, 'throws on wrong nodes')
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

// #################### Complex Node Identification

test('staticAnalysisCommon.isBuiltinFunctionCall', function (t) {
  t.plan(2)
  var selfdestruct = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (address)',
          'value': 'selfdestruct'
        },
        'name': 'Identifier'
      },
      {
        'attributes': {
          'type': 'address',
          'value': 'a'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'FunctionCall'
  }
  var localCall = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'name': 'Identifier'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'FunctionCall'
  }

  t.ok(common.isBuiltinFunctionCall(selfdestruct), 'selfdestruct is builtin')
  t.notOk(common.isBuiltinFunctionCall(localCall), 'local call is not builtin')
})

test('staticAnalysisCommon.isStorageVariableDeclaration', function (t) {
  t.plan(3)
  var node1 = {
    'attributes': {
      'name': 'x',
      'type': 'struct Ballot.Voter storage pointer'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'id': 43,
        'name': 'UserDefinedTypeName',
        'src': '604:5:0'
      }
    ],
    'id': 44,
    'name': 'VariableDeclaration',
    'src': '604:15:0'
  }
  var node2 = {
    'attributes': {
      'name': 'voters',
      'type': 'mapping(address => struct Ballot.Voter storage ref)'
    },
    'children': [
      {
        'children': [
          {
            'attributes': {
              'name': 'address'
            },
            'id': 16,
            'name': 'ElementaryTypeName',
            'src': '235:7:0'
          },
          {
            'attributes': {
              'name': 'Voter'
            },
            'id': 17,
            'name': 'UserDefinedTypeName',
            'src': '246:5:0'
          }
        ],
        'id': 18,
        'name': 'Mapping',
        'src': '227:25:0'
      }
    ],
    'id': 19,
    'name': 'VariableDeclaration',
    'src': '227:32:0'
  }
  var node3 = {
    'attributes': {
      'name': 'voters',
      'type': 'bytes32'
    },
    'children': [
      {
        'attributes': {
          'name': 'bytes'
        },
        'id': 16,
        'name': 'ElementaryTypeName',
        'src': '235:7:0'
      }
    ],
    'id': 19,
    'name': 'VariableDeclaration',
    'src': '227:32:0'
  }

  t.ok(common.isStorageVariableDeclaration(node1), 'struct storage pointer param is storage')
  t.ok(common.isStorageVariableDeclaration(node2), 'struct storage pointer mapping param is storage')
  t.notOk(common.isStorageVariableDeclaration(node3), 'bytes is not storage')
})

test('staticAnalysisCommon.isInteraction', function (t) {
  t.plan(6)
  var sendAst = { name: 'MemberAccess', children: [{attributes: { value: 'd', type: 'address' }}], attributes: { value: 'send', type: 'function (uint256) returns (bool)' } }
  var callAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var callcodeAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'callcode', type: 'function () payable returns (bool)' } }
  var delegatecallAst = { name: 'MemberAccess', children: [{attributes: { value: 'g', type: 'address' }}], attributes: { member_name: 'delegatecall', type: 'function () returns (bool)' } }
  var nodeExtDir = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }
  var nodeNot = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }

  t.ok(common.isInteraction(sendAst), 'send is interaction')
  t.ok(common.isInteraction(callAst), 'call is interaction')
  t.ok(common.isInteraction(nodeExtDir), 'ExternalDirecCall is interaction')
  t.notOk(common.isInteraction(callcodeAst), 'callcode is not interaction')
  t.notOk(common.isInteraction(delegatecallAst), 'callcode is not interaction')
  t.notOk(common.isInteraction(nodeNot), 'local call is not interaction')
})

test('staticAnalysisCommon.isEffect', function (t) {
  t.plan(5)
  var inlineAssembly = {
    'children': [
    ],
    'id': 21,
    'name': 'InlineAssembly',
    'src': '809:41:0'
  }
  var assignment = {
    'attributes': {
      'operator': '=',
      'type': 'uint256'
    },
    'children': [
      {
        'attributes': {
          'type': 'uint256'
        },
        'children': [
          {
            'attributes': {
              'type': 'mapping(address => uint256)',
              'value': 'c'
            },
            'id': 61,
            'name': 'Identifier',
            'src': '873:1:0'
          },
          {
            'attributes': {
              'member_name': 'sender',
              'type': 'address'
            },
            'children': [
              {
                'attributes': {
                  'type': 'msg',
                  'value': 'msg'
                },
                'id': 62,
                'name': 'Identifier',
                'src': '875:3:0'
              }
            ],
            'id': 63,
            'name': 'MemberAccess',
            'src': '875:10:0'
          }
        ],
        'id': 64,
        'name': 'IndexAccess',
        'src': '873:13:0'
      },
      {
        'attributes': {
          'hexvalue': '30',
          'subdenomination': null,
          'token': null,
          'type': 'int_const 0',
          'value': '0'
        },
        'id': 65,
        'name': 'Literal',
        'src': '889:1:0'
      }
    ],
    'id': 66,
    'name': 'Assignment',
    'src': '873:17:0'
  }
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
  var inlineAssembly = {
    'children': [
    ],
    'id': 21,
    'name': 'InlineAssembly',
    'src': '809:41:0'
  }
  var assignment = {
    'attributes': {
      'operator': '=',
      'type': 'uint256'
    },
    'children': [
      {
        'attributes': {
          'type': 'uint256'
        },
        'children': [
          {
            'attributes': {
              'type': 'mapping(address => uint256)',
              'value': 'c'
            },
            'id': 61,
            'name': 'Identifier',
            'src': '873:1:0'
          },
          {
            'attributes': {
              'member_name': 'sender',
              'type': 'address'
            },
            'children': [
              {
                'attributes': {
                  'type': 'msg',
                  'value': 'msg'
                },
                'id': 62,
                'name': 'Identifier',
                'src': '875:3:0'
              }
            ],
            'id': 63,
            'name': 'MemberAccess',
            'src': '875:10:0'
          }
        ],
        'id': 64,
        'name': 'IndexAccess',
        'src': '873:13:0'
      },
      {
        'attributes': {
          'hexvalue': '30',
          'subdenomination': null,
          'token': null,
          'type': 'int_const 0',
          'value': '0'
        },
        'id': 65,
        'name': 'Literal',
        'src': '889:1:0'
      }
    ],
    'id': 66,
    'name': 'Assignment',
    'src': '873:17:0'
  }
  var node1 = {
    'attributes': {
      'name': 'x',
      'type': 'struct Ballot.Voter storage pointer'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }
  var node2 = {
    'attributes': {
      'name': 'y',
      'type': 'uint'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }
  var node3 = {
    'attributes': {
      'name': 'xx',
      'type': 'uint'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }
  t.ok(common.isWriteOnStateVariable(inlineAssembly, [node1, node2, node3]), 'inline Assembly is write on state')
  t.notOk(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on non state is not write on state')
  node3.attributes.name = 'c'
  t.ok(common.isWriteOnStateVariable(assignment, [node1, node2, node3]), 'assignment on state is not write on state')
})

test('staticAnalysisCommon.isStateVariable', function (t) {
  t.plan(3)
  var node1 = {
    'attributes': {
      'name': 'x',
      'type': 'struct Ballot.Voter storage pointer'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }
  var node2 = {
    'attributes': {
      'name': 'y',
      'type': 'uint'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }
  var node3 = {
    'attributes': {
      'name': 'xx',
      'type': 'uint'
    },
    'children': [
      {
        'attributes': {
          'name': 'Voter'
        },
        'name': 'UserDefinedTypeName'
      }
    ],
    'name': 'VariableDeclaration'
  }

  t.ok(common.isStateVariable('x', [node1, node2]), 'is contained')
  t.ok(common.isStateVariable('x', [node2, node1, node1]), 'is contained twice')
  t.notOk(common.isStateVariable('x', [node2, node3]), 'not contained')
})

test('staticAnalysisCommon.isConstantFunction', function (t) {
  t.plan(3)
  var node1 = { name: 'FunctionDefinition', attributes: { constant: true } }
  var node2 = { name: 'FunctionDefinition', attributes: { constant: false } }
  var node3 = { name: 'MemberAccess', attributes: { constant: true } }

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
  var node1 = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'name': 'Identifier'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'FunctionCall'
  }

  t.ok(common.isCallToNonConstLocalFunction(node1), 'should be call to non const Local func')
  node1.children[0].attributes.type = 'function (struct Ballot.Voter storage pointer) constant payable (uint256)'
  t.notok(common.isCallToNonConstLocalFunction(node1), 'should no longer be call to non const Local func')
})

test('staticAnalysisCommon.isExternalDirectCall', function (t) {
  t.plan(5)
  var node = {
    attributes: {
      member_name: 'info',
      type: 'function () payable external returns (uint256)'
    },
    children: [
      {
        attributes: {
          type: 'contract InfoFeed',
          value: 'f'
        },
        id: 30,
        name: 'Identifier',
        src: '405:1:0'
      }
    ],
    id: 32,
    name: 'MemberAccess',
    src: '405:6:0'
  }

  var node2 = { name: 'MemberAccess', children: [{attributes: { value: 'this', type: 'contract test' }}], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
  t.ok(common.isExternalDirectCall(node), 'f.info() should be external direct call')
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
  var node = {
    'attributes': {
      'member_name': 'blockhash',
      'type': 'function (uint256) returns (bytes32)'
    },
    'children': [
      {
        'attributes': {
          'type': 'block',
          'value': 'block'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }

  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.ok(common.isBlockBlockHashAccess(node), 'blockhash should work') // todo:
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.isThisLocalCall', function (t) {
  t.plan(3)
  var node = { name: 'MemberAccess', children: [{attributes: { value: 'this', type: 'contract test' }}], attributes: { value: 'b', type: 'function (bytes32,address) returns (bool)' } }
  t.ok(common.isThisLocalCall(node), 'is this.local_method() used should work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.isSuperLocalCall', function (t) {
  t.plan(4)
  var node = {
    'attributes': {
      'member_name': 'duper',
      'type': 'function ()'
    },
    'children': [
      {
        'attributes': {
          'type': 'contract super a',
          'value': 'super'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  t.ok(common.isSuperLocalCall(node), 'is super.local_method() used should work')
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.isLibraryCall', function (t) {
  t.plan(5)
  var node = {
    'attributes': {
      'member_name': 'insert',
      'type': 'function (struct Set.Data storage pointer,uint256) returns (bool)'
    },
    'children': [
      {
        'attributes': {
          'type': 'type(library Set)',
          'value': 'Set'
        },
        'name': 'Identifier'
      }
    ],
    'name': 'MemberAccess'
  }
  t.ok(common.isLibraryCall(node), 'is lib call should not work')
  t.notOk(common.isSuperLocalCall(node), 'is super.local_method() used should not work')
  t.notOk(common.isThisLocalCall(node), 'is this.local_method() used should not work')
  t.notOk(common.isBlockTimestampAccess(node), 'is block.timestamp used should not work')
  t.notOk(common.isNowAccess(node), 'is now used should not work')
})

test('staticAnalysisCommon.isLocalCall', function (t) {
  t.plan(5)
  var node1 = {
    'attributes': {
      'type': 'tuple()',
      'type_conversion': false
    },
    'children': [
      {
        'attributes': {
          'type': 'function (struct Ballot.Voter storage pointer)',
          'value': 'bli'
        },
        'id': 37,
        'name': 'Identifier',
        'src': '540:3:0'
      },
      {
        'attributes': {
          'type': 'struct Ballot.Voter storage pointer',
          'value': 'x'
        },
        'id': 38,
        'name': 'Identifier',
        'src': '544:1:0'
      }
    ],
    'id': 39,
    'name': 'FunctionCall',
    'src': '540:6:0'
  }

  t.ok(common.isLocalCall(node1), 'isLocalCall')
  t.notOk(common.isLowLevelCall(node1), 'is not low level call')
  t.notOk(common.isExternalDirectCall(node1), 'is not external direct call')
  t.notOk(common.isEffect(node1), 'is not effect')
  t.notOk(common.isInteraction(node1), 'is not interaction')
})

test('staticAnalysisCommon.isLowLevelCall', function (t) {
  t.plan(6)
  var sendAst = { name: 'MemberAccess', children: [{attributes: { value: 'd', type: 'address' }}], attributes: { value: 'send', type: 'function (uint256) returns (bool)' } }
  var callAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'call', type: 'function () payable returns (bool)' } }
  var callcodeAst = { name: 'MemberAccess', children: [{attributes: { value: 'f', type: 'address' }}], attributes: { member_name: 'callcode', type: 'function () payable returns (bool)' } }
  var delegatecallAst = { name: 'MemberAccess', children: [{attributes: { value: 'g', type: 'address' }}], attributes: { member_name: 'delegatecall', type: 'function () returns (bool)' } }

  t.ok(common.isLowLevelSendInst(sendAst) && common.isLowLevelCall(sendAst), 'send is llc should work')
  t.ok(common.isLowLevelCallInst(callAst) && common.isLowLevelCall(callAst), 'call is llc should work')
  t.notOk(common.isLowLevelCallInst(callcodeAst), 'callcode is not call')
  t.ok(common.isLowLevelCallcodeInst(callcodeAst) && common.isLowLevelCall(callcodeAst), 'callcode is llc should work')
  t.notOk(common.isLowLevelCallcodeInst(callAst), 'call is not callcode')
  t.ok(common.isLowLevelDelegatecallInst(delegatecallAst) && common.isLowLevelCall(delegatecallAst), 'delegatecall is llc should work')
})
