'use strict'
var tape = require('tape')
var txFormat = require('../src/execution/txFormat')
var compiler = require('solc')
var compilerInput = require('../src/helpers/compilerHelper').compilerInput
var executionContext = require('../src/execution/execution-context')

/* tape *********************************************************** */

var context
tape('ContractParameters - (TxFormat.buildData) - format input parameters', function (t) {
  var output = compiler.compileStandardWrapper(compilerInput(uintContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['uintContractTest']
  context = { output, contract }
  var bytecode = '608060405234801561001057600080fd5b50610111806100206000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634b521953146044575b600080fd5b348015604f57600080fd5b50609660048036038101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506098565b005b8260008190555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050505600a165627a7a7230582037f597c9a62fb1df1e054664a26243a8cde5c0122020c0b178fd655fff8b10f70029'
  t.test('(TxFormat.buildData)', function (st) {
    st.plan(3)
    testWithInput(st, '123123, "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "34"', bytecode + '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000022')
    testWithInput(st, '"123123" , 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8,   654   ', bytecode + '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000000000000000000000000000000000000000028e')
    // parsing this as javascript number should overflow
    testWithInput(st, '90071992547409910000, 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8, 0', bytecode + '000000000000000000000000000000000000000000000004e1ffffffffffd8f0000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000000')
  })
})

function testWithInput (st, params, expected) {
  txFormat.buildData('uintContractTest', context.contract, context.output.contracts, true, context.contract.abi[0], params, (error, data) => {
    if (error) { return st.fails(error) }
    console.log(data)
    st.equal(data.dataHex, expected)
  }, () => {}, () => {})
}

/* tape *********************************************************** */

tape('ContractParameters - (TxFormat.buildData) - link Libraries', function (t) {
  executionContext.setContext('vm')
  var compileData = compiler.compileStandardWrapper(compilerInput(deploySimpleLib))

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
  var data = '608060405234801561001057600080fd5b5061026b806100206000396000f300608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636d4ce63c14610046575b600080fd5b34801561005257600080fd5b5061005b61005d565b005b73f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b1580156100bd57600080fd5b505af41580156100d1573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b15801561013557600080fd5b505af4158015610149573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e336344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b1580156101ad57600080fd5b505af41580156101c1573d6000803e3d6000fd5b5050505073f7a10e525d4b168f45f74db1b61f63d3e7619e116344733ae16040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160006040518083038186803b15801561022557600080fd5b505af4158015610239573d6000803e3d6000fd5b505050505600a165627a7a7230582090b0bbf59fc9b1f13331039529d287ce9a9e712ce22dc71025510293d18104bc0029'


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
  var output = compiler.compileStandardWrapper(compilerInput(encodeFunctionCall))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['testContractLinkLibrary']
  txFormat.encodeFunctionCall('123, "test string"', contract.abi[0], (error, encoded) => {
    st.equal(encoded.dataHex, '0x805da4ad000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b7465737420737472696e67000000000000000000000000000000000000000000')
  })
}

/* *********************************************************** */

var uintContract = `contract uintContractTest {
    uint _tp;
    address _ap;
    function test(uint _t, address _a, uint _i) {
        _tp = _t;
        _ap = _a;
    }
}`

var deploySimpleLib = `pragma solidity ^0.4.4;

library lib1 {
    function getEmpty () {
    }
}

library lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2 {
    function getEmpty () {
    }
}

contract testContractLinkLibrary { 
    function get () {
        lib1.getEmpty();
        lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2.getEmpty();
        lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2_lib2.getEmpty();
        lib1.getEmpty();
 }
 }`

var encodeFunctionCall = `pragma solidity ^0.4.4;

contract testContractLinkLibrary { 
    function get (uint _p, string _o) {
        
 }
 }`
