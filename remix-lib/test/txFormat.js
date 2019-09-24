'use strict'
var tape = require('tape')
var txFormat = require('../src/execution/txFormat')
var txHelper = require('../src/execution/txHelper')
var util = require('../src/util')
var compiler = require('solc')
var compilerInput = require('../src/helpers/compilerHelper').compilerInput
var executionContext = require('../src/execution/execution-context')
var solidityVersion = 'v0.5.11+commit.c082d0b4'

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


tape('ContractStringParameters - (TxFormat.buildData) - format string input parameters', function (t) {
  var output = compiler.compile(compilerInput(stringContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['stringContractTest']
  context = { output, contract }
  t.test('(TxFormat.buildData)', function (st) {
    st.plan(3)
    testWithStringInput(st, '"1,2,3,4qwerty,5", 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8, "1,a,5,34"', '0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000f312c322c332c347177657274792c3500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008312c612c352c3334000000000000000000000000000000000000000000000000')
    testWithStringInput(st, '"1,2,3,4qwerty,5", "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "1,a,5,34"', '0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000f312c322c332c347177657274792c3500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008312c612c352c3334000000000000000000000000000000000000000000000000')
    // string with space
    testWithStringInput(st, '"1,2,3,,4qw  erty,5", "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "abcdefghijkl"', '0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000012312c322c332c2c3471772020657274792c350000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c6162636465666768696a6b6c0000000000000000000000000000000000000000')
  })
})

function testWithStringInput (st, params, expected) {
  txFormat.buildData('stringContractTest', context.contract, context.output.contracts, true, context.contract.abi[0], params, (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    if (!data.dataHex.endsWith(expected)) {
      st.fail(`result of buildData ${data.dataHex} should end with ${expected} . `)
    } else {
      st.pass(`testWithStringInput. result of buildData ${data.dataHex} ends with correct data`)
    }
  }, () => {}, () => {})
}

tape('ContractArrayParameters - (TxFormat.buildData) - format array input parameters', function (t) {
  var output = compiler.compile(compilerInput(arrayContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['arrayContractTest']
  context = { output, contract }
  t.test('(TxFormat.buildData)', function (st) {
    st.plan(3)
    testWithArrayInput(st, '[true, false, true], ["0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8"], ["0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd", "0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd"], [12, 34, 45], "itsremix"', '00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000020c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002d000000000000000000000000000000000000000000000000000000000000000869747372656d6978000000000000000000000000000000000000000000000000')
    testWithArrayInput(st, '[true, false, true], ["0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8"], ["0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd", "0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd"], ["12", "34", "45"], "itsremix"', '00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000020c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002d000000000000000000000000000000000000000000000000000000000000000869747372656d6978000000000000000000000000000000000000000000000000')
    // with complex string containing comma, space and underscore
    testWithArrayInput(st, '[true, false, true], ["0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8"], ["0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd", "0x0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd"], ["12", "34", "45"], "its  _  re, m,ix"', '00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea800000000000000000000000000000000000000000000000000000000000000020c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0c5d9661b4fb92eb7472f28510ea68d4f369c8fe57b3ed4c2e8dfa4e79e549fd0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002d000000000000000000000000000000000000000000000000000000000000001069747320205f202072652c206d2c697800000000000000000000000000000000')
  })
})

function testWithArrayInput (st, params, expected) {
  txFormat.buildData('arrayContractTest', context.contract, context.output.contracts, true, context.contract.abi[0], params, (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    if (!data.dataHex.endsWith(expected)) {
      st.fail(`result of buildData ${data.dataHex} should end with ${expected} . `)
    } else {
      st.pass(`testWithArrayInput. result of buildData ${data.dataHex} ends with correct data`)
    }
  }, () => {}, () => {})
}

tape('ContractNestedArrayParameters - (TxFormat.buildData) - format nested array input parameters', function (t) {
  var output = compiler.compile(compilerInput(nestedArrayContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['nestedArrayContractTest']
  context = { output, contract }
  t.test('(TxFormat.buildData)', function (st) {
    st.plan(2)
    testWithNestedArrayInput(st, '[[true],[false]]  , [ [[1,2],[3,4],[5,6]],  [[1,2],[3,4],[5,6]],  [ [1,2],[3,4],[5,6]] ],  "ab ab, a,b",  145', '0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000091000000000000000000000000000000000000000000000000000000000000000a61622061622c20612c6200000000000000000000000000000000000000000000')
    testWithNestedArrayInput(st, '[[true],[false]]  , [ [["1","2"],["3","4"],["5","6"]],  [ ["1","2"],["3","4"],["5","6"]],  [ ["1","2"],["3","4"],["5","6"]] ],  "ab ab, a,b",  "145"', '0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000091000000000000000000000000000000000000000000000000000000000000000a61622061622c20612c6200000000000000000000000000000000000000000000')
  })
})

function testWithNestedArrayInput (st, params, expected) {
  txFormat.buildData('nestedArrayContractTest', context.contract, context.output.contracts, true, context.contract.abi[1], params, (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    if (!data.dataHex.endsWith(expected)) {
      st.fail(`result of buildData ${data.dataHex} should end with ${expected} . `)
    } else {
      st.pass(`testWithNestedArrayInput. result of buildData ${data.dataHex} ends with correct data`)
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

  var data = '608060405234801561001057600080fd5b506101e1806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80636d4ce63c14610030575b600080fd5b61003861003a565b005b73f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff1660e01b815260040160006040518083038186803b15801561007e57600080fd5b505af4158015610092573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff1660e01b815260040160006040518083038186803b1580156100da57600080fd5b505af41580156100ee573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff1660e01b815260040160006040518083038186803b15801561013657600080fd5b505af415801561014a573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff1660e01b815260040160006040518083038186803b15801561019257600080fd5b505af41580156101a6573d6000803e3d6000fd5b5050505056fea265627a7a72315820dd9fcfc020e6f69aedda5976b9a882d7955d9b71df3b292a57adddb96d0f7a2064736f6c634300050b0032'

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

var stringContract = `contract stringContractTest {
  string _tp;
  address _ap;
  function test(string memory _t, address _a, string memory _i) public {
      _tp = _t;
      _ap = _a;
  }
}`

var arrayContract = `contract arrayContractTest {
  string _sp;
  address _ap;
  uint _up;
  bytes32 _bp;
  bool _flag;

  function test(bool[] memory _b, address[] memory _a, bytes32[] memory names, uint[] memory _nums, string memory _i) public {
      _up = _nums[0];
      _ap = _a[0];
      _bp = names[0];
      _sp = _i;
      _flag = _b[0];
  }
}`

var nestedArrayContract = `contract nestedArrayContractTest {
  uint public co;
  string public str;
  bool public b1;
  bool public b2;

  function test(bool[1][2] memory _p, uint [2][3][3] memory _u, string memory _s, uint p) public {
      co = p;
      b1 = _p[0][0];
      b2= _p[1][0];
      str = _s;
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
