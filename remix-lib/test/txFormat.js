'use strict'
var tape = require('tape')
var txFormat = require('../src/execution/txFormat')
var txHelper = require('../src/execution/txHelper')
var util = require('../src/util')
var compiler = require('solc')
var compilerInput = require('../src/helpers/compilerHelper').compilerInput
var executionContext = require('../src/execution/execution-context')
var solidityVersion = 'v0.5.4+commit.9549d8ff'

/* tape *********************************************************** */
tape('load compiler ' + solidityVersion, function (t) {
  compiler.loadRemoteVersion(solidityVersion, (error, solcSnapshot) => {
    if (error) console.log(error)
    console.warn('testing *txFormat* against', solidityVersion)
    compiler = solcSnapshot
    t.end()
  })
})

var context
tape('ContractParameters - (TxFormat.buildData) - format input parameters', function (t) {
  var output = compiler.compile(compilerInput(uintContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['uintContractTest']
  context = { output, contract }

  t.test('(TxFormat.buildData)', function (st) {
    st.plan(3)
    testWithInput(st, '123123, "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "34"', '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000022')
    testWithInput(st, '"123123" , 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8,   654   ', '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000000000000000000000000000000000000000028e')
    // parsing this as javascript number should overflow
    testWithInput(st, '90071992547409910000, 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8, 0', '000000000000000000000000000000000000000000000004e1ffffffffffd8f0000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000000')
  })
})

function testWithInput (st, params, expected) {
  txFormat.buildData('uintContractTest', context.contract, context.output.contracts, true, context.contract.abi[0], params, (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    if (!data.dataHex.endsWith(expected)) {
      st.fail(`result of buildData ${data.dataHex} should end with ${expected} . `)
    } else {
      st.pass(`testWithInput. result of buildData ${data.dataHex} ends with correct data`)
    }
  }, () => {}, () => {})
}

/* tape *********************************************************** */

tape('ContractParameters - (TxFormat.buildData) - link Libraries', function (t) {
  executionContext.setContext('vm')
  var compileData = compiler.compile(compilerInput(deploySimpleLib))

  var fakeDeployedContracts = {
    lib1: '0xf7a10e525d4b168f45f74db1b61f63d3e7619e11',
    lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2: '0xf7a10e525d4b168f45f74db1b61f63d3e7619e33',
    testContractLinkLibrary: '0xf7a10e525d4b168f45f74db1b61f63d3e7619e22'
  }
  var callbackDeployLibraries = (param, callback) => {
    callback(null, {
      result: {
        createdAddress: fakeDeployedContracts[param.data.contractName]
      }
    })
  } // fake

  t.test('(TxFormat.buildData and link library (standard way))', function (st) {
    st.plan(6)
    var output = JSON.parse(compileData)
    var contract = output.contracts['test.sol']['testContractLinkLibrary']
    context = { output, contract }
    testLinkLibrary(st, fakeDeployedContracts, callbackDeployLibraries)
  })

  t.test('(TxFormat.encodeConstructorCallAndLinkLibraries and link library (standard way))', function (st) {
    st.plan(12)
    var output = JSON.parse(compileData)
    var contract = output.contracts['test.sol']['testContractLinkLibrary']
    context = { output, contract }
    testLinkLibrary2(st, callbackDeployLibraries)
  })
})

function testLinkLibrary (st, fakeDeployedContracts, callbackDeployLibraries) {
  var deployMsg = ['creation of library test.sol:lib1 pending...',
  'creation of library test.sol:lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2 pending...']
  txFormat.buildData('testContractLinkLibrary', context.contract, context.output.contracts, true, context.contract.abi[0], '', (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    var linkedbyteCode = data.dataHex
    var libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib1']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), fakeDeployedContracts['lib1'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), fakeDeployedContracts['lib1'].replace('0x', ''))

    libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), fakeDeployedContracts['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), fakeDeployedContracts['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
  }, (msg) => {
    st.equal(msg, deployMsg[0])
    deployMsg.shift()
  }, callbackDeployLibraries)
}

function testLinkLibrary2 (st, callbackDeployLibraries) {
  var librariesReference = {
    'test.sol': {
      'lib1': '0xf7a10e525d4b168f45f74db1b61f63d3e7619e11',
      'lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2': '0xf7a10e525d4b168f45f74db1b61f63d3e7619e33'
    }
  }

  var data = '608060405234801561001057600080fd5b50610265806100206000396000f3fe608060405234801561001057600080fd5b5060043610610048576000357c0100000000000000000000000000000000000000000000000000000000900480636d4ce63c1461004d575b600080fd5b610055610057565b005b73f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b1580156100b757600080fd5b505af41580156100cb573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b15801561012f57600080fd5b505af4158015610143573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b1580156101a757600080fd5b505af41580156101bb573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b15801561021f57600080fd5b505af4158015610233573d6000803e3d6000fd5b5050505056fea165627a7a72305820de710906b1469945168cc4ab673a539fd4378ef8d16f7d010bf1d14f11efb7ca0029'

  var deployMsg = ['creation of library test.sol:lib1 pending...',
  'creation of library test.sol:lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2 pending...']
  txFormat.encodeConstructorCallAndLinkLibraries(context.contract, '', context.contract.abi[0], librariesReference, context.contract.evm.bytecode.linkReferences, (error, result) => {
    console.log(error, result)
    st.equal(data, result.dataHex)
    var linkedbyteCode = result.dataHex
    var libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib1']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), librariesReference['test.sol']['lib1'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), librariesReference['test.sol']['lib1'].replace('0x', ''))

    libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), librariesReference['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), librariesReference['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
  })

  txFormat.encodeConstructorCallAndDeployLibraries('testContractLinkLibrary', context.contract, context.output.contracts, '', context.contract.abi[0], (error, result) => {
    console.log(error, result)
    st.equal(data, result.dataHex)
    var linkedbyteCode = result.dataHex
    var libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib1']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), librariesReference['test.sol']['lib1'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), librariesReference['test.sol']['lib1'].replace('0x', ''))

    libReference = context.contract.evm.bytecode.linkReferences['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2']
    st.equal(linkedbyteCode.substr(2 * libReference[0].start, 40), librariesReference['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
    st.equal(linkedbyteCode.substr(2 * libReference[1].start, 40), librariesReference['test.sol']['lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2'].replace('0x', ''))
  }, (msg) => {
    st.equal(msg, deployMsg[0])
    deployMsg.shift()
  }, callbackDeployLibraries)
}

/* tape *********************************************************** */

tape('EncodeParameter', function (t) {
  t.test('(TxFormat.encodeFunctionCall)', function (st) {
    st.plan(1)
    encodeFunctionCallTest(st)
  })
})

function encodeFunctionCallTest (st) {
  var output = compiler.compile(compilerInput(encodeFunctionCall))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['testContractLinkLibrary']
  txFormat.encodeFunctionCall('123, "test string"', contract.abi[0], (error, encoded) => {
    console.log(error)
    st.equal(encoded.dataHex, '0x805da4ad000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b7465737420737472696e67000000000000000000000000000000000000000000')
  })
}

/* *********************************************************** */

tape('test fallback function', function (t) {
  t.test('(fallback)', function (st) {
    st.plan(2)
    var output = compiler.compile(compilerInput(fallbackFunction))
    output = JSON.parse(output)
    var contract = output.contracts['test.sol']['fallbackFunctionContract']
    st.equal(txHelper.encodeFunctionId(contract.abi[0]), '0x805da4ad')
    st.equal(txHelper.encodeFunctionId(contract.abi[1]), '0x')
  })
})

tape('test abiEncoderV2', function (t) {
  var functionId = '0x56d89238'
  var encodedData = '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000042ed123b0bd8203c2700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000090746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f746573745f737472696e675f00000000000000000000000000000000'
  var value1 = '1'
  var value2 = '1234567890123456789543'
  var value3 = 'test_string_test_string_test_string_test_string_test_string_test_string_test_string_test_string_test_string_test_string_test_string_test_string_'
  var decodedData = `[${value1}, ${value2}, "${value3}"], 23`
  t.test('(abiEncoderV2)', function (st) {
    st.plan(2)
    var output = compiler.compile(compilerInput(abiEncoderV2))
    output = JSON.parse(output)
    var contract = output.contracts['test.sol']['test']
    txFormat.encodeFunctionCall(decodedData, contract.abi[0], (error, encoded) => {
      console.log(error)
      st.equal(encoded.dataHex, functionId + encodedData.replace('0x', ''))
    })
    var decoded = txFormat.decodeResponse(util.hexToIntArray(encodedData), contract.abi[0])
    console.log(decoded)
    st.equal(decoded[0], `tuple(uint256,uint256,string): ${value1},${value2},${value3}`)
  })
})

tape('test abiEncoderV2 array of tuple', function (t) {
  t.test('(abiEncoderV2)', function (st) {
    /*
    {
	    "685e37ad": "addStructs((uint256,string))",
	    "e5cb65f9": "addStructs((uint256,string)[])"
    }
    */
    st.plan(2)

    var output = compiler.compile(compilerInput(abiEncoderV2ArrayOfTuple))
    output = JSON.parse(output)
    var contract = output.contracts['test.sol']['test']
    txFormat.encodeParams('[34, "test"]', contract.abi[0], (error, encoded) => {
      console.log(error)
      var decoded = txFormat.decodeResponse(util.hexToIntArray(encoded.dataHex), contract.abi[0])
      console.log(decoded)
      st.equal(decoded[0], 'tuple(uint256,string): _strucmts 34,test')
    })

    txFormat.encodeParams('[[34, "test"], [123, "test2"]]', contract.abi[1], (error, encoded) => {
      console.log(error)
      var decoded = txFormat.decodeResponse(util.hexToIntArray(encoded.dataHex), contract.abi[1])
      console.log(decoded)
      st.equal(decoded[0], 'tuple(uint256,string)[]: strucmts 34,test,123,test2')
    })
  })
})

var uintContract = `contract uintContractTest {
    uint _tp;
    address _ap;
    function test(uint _t, address _a, uint _i) public {
        _tp = _t;
        _ap = _a;
    }
}`

var deploySimpleLib = `pragma solidity ^0.5.0;

library lib1 {
    function getEmpty () public {
    }
}

library lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2 {
    function getEmpty () public {
    }
}

contract testContractLinkLibrary {
    function get () public {
        lib1.getEmpty();
        lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2.getEmpty();
        lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2.getEmpty();
        lib1.getEmpty();
 }
 }`

var encodeFunctionCall = `pragma solidity ^0.5.0;

contract testContractLinkLibrary {
    function get (uint _p, string memory _o) public {
    }
 }`

var fallbackFunction = `pragma solidity ^0.5.0;

contract fallbackFunctionContract {
    function get (uint _p, string memory _o) public {
    }

    function () external {}
 }`

var abiEncoderV2 = `pragma experimental ABIEncoderV2;

contract test {
    struct p {
        uint a;
        uint b;
        string s;
    }
    function t (p memory _p, uint _i) public returns (p memory) {
        return _p;
    }

     function t () public returns (p memory) {
        p memory mm;
        mm.a = 123;
        mm.b = 133;
        return mm;
    }
}`

var abiEncoderV2ArrayOfTuple = `pragma experimental ABIEncoderV2;
contract test {

    struct MyStruct {uint256 num; string  _string;}

    constructor (MyStruct[] memory _structs, string memory _str) public {

    }

    function addStructs(MyStruct[] memory _structs) public returns (MyStruct[] memory strucmts) {
       strucmts = _structs;
    }

    function addStructs(MyStruct memory _structs) public returns (MyStruct memory _strucmts) {
      _strucmts = _structs;
    }
}`
