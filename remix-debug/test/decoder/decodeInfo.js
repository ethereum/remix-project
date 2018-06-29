'use strict'
var tape = require('tape')
var compiler = require('solc')
var astHelper = require('../../src/solidity-decoder/astHelper')
var decodeInfo = require('../../src/solidity-decoder/decodeInfo')
var stateDecoder = require('../../src/solidity-decoder/stateDecoder')
var contracts = require('./contracts/miscContracts')
var simplecontracts = require('./contracts/simpleContract')
var remixLib = require('remix-lib')
var compilerInput = remixLib.helpers.compiler.compilerInput
var util = require('../../src/solidity-decoder/types/util')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compileStandardWrapper(compilerInput(contracts))
    output = JSON.parse(output)

    var state = astHelper.extractStateDefinitions('test.sol:contractUint', output.sources)
    var states = astHelper.extractStatesDefinitions(output.sources)
    var stateDef = state.stateDefinitions
    var parsedType = decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractUint', util.extractLocationFromAstVariable(stateDef[0]))
    checkDecodeInfo(st, parsedType, 1, 1, 'uint8')
    parsedType = decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractUint', util.extractLocationFromAstVariable(stateDef[2]))
    checkDecodeInfo(st, parsedType, 1, 32, 'uint256')
    parsedType = decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractUint', util.extractLocationFromAstVariable(stateDef[3]))
    checkDecodeInfo(st, parsedType, 1, 32, 'uint256')
    parsedType = decodeInfo.parseType(stateDef[4].attributes.type, states, 'contractUint', util.extractLocationFromAstVariable(stateDef[4]))
    checkDecodeInfo(st, parsedType, 1, 16, 'bytes16')

    state = astHelper.extractStateDefinitions('test.sol:contractStructAndArray', output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractStructAndArray', util.extractLocationFromAstVariable(stateDef[1]))
    checkDecodeInfo(st, parsedType, 2, 32, 'struct contractStructAndArray.structDef')
    parsedType = decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractStructAndArray', util.extractLocationFromAstVariable(stateDef[2]))
    checkDecodeInfo(st, parsedType, 6, 32, 'struct contractStructAndArray.structDef[3]')
    parsedType = decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractStructAndArray', util.extractLocationFromAstVariable(stateDef[3]))
    checkDecodeInfo(st, parsedType, 2, 32, 'bytes12[4]')

    state = astHelper.extractStateDefinitions('test.sol:contractArray', output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractArray', util.extractLocationFromAstVariable(stateDef[0]))
    checkDecodeInfo(st, parsedType, 1, 32, 'uint32[5]')
    parsedType = decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractArray', util.extractLocationFromAstVariable(stateDef[1]))
    checkDecodeInfo(st, parsedType, 1, 32, 'int8[]')
    parsedType = decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractArray', util.extractLocationFromAstVariable(stateDef[2]))
    checkDecodeInfo(st, parsedType, 4, 32, 'int16[][3][][4]')

    state = astHelper.extractStateDefinitions('test.sol:contractEnum', output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractEnum')
    checkDecodeInfo(st, parsedType, 1, 2, 'enum')

    state = astHelper.extractStateDefinitions('test.sol:contractSmallVariable', output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[0]))
    checkDecodeInfo(st, parsedType, 1, 1, 'int8')
    parsedType = decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[1]))
    checkDecodeInfo(st, parsedType, 1, 1, 'uint8')
    parsedType = decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[2]))
    checkDecodeInfo(st, parsedType, 1, 2, 'uint16')
    parsedType = decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[3]))
    checkDecodeInfo(st, parsedType, 1, 4, 'int32')
    parsedType = decodeInfo.parseType(stateDef[4].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[4]))
    checkDecodeInfo(st, parsedType, 1, 32, 'uint256')
    parsedType = decodeInfo.parseType(stateDef[5].attributes.type, states, 'contractSmallVariable', util.extractLocationFromAstVariable(stateDef[5]))
    checkDecodeInfo(st, parsedType, 1, 2, 'int16')

    output = compiler.compileStandardWrapper(compilerInput(simplecontracts))
    output = JSON.parse(output)

    state = astHelper.extractStateDefinitions('test.sol:simpleContract', output.sources)
    states = astHelper.extractStatesDefinitions(output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[2].attributes.type, states, 'simpleContract', util.extractLocationFromAstVariable(stateDef[2]))
    checkDecodeInfo(st, parsedType, 2, 32, 'struct simpleContract.structDef')
    parsedType = decodeInfo.parseType(stateDef[3].attributes.type, states, 'simpleContract', util.extractLocationFromAstVariable(stateDef[3]))
    checkDecodeInfo(st, parsedType, 6, 32, 'struct simpleContract.structDef[3]')
    parsedType = decodeInfo.parseType(stateDef[4].attributes.type, states, 'simpleContract', util.extractLocationFromAstVariable(stateDef[4]))
    checkDecodeInfo(st, parsedType, 1, 1, 'enum')

    state = astHelper.extractStateDefinitions('test.sol:test2', output.sources)
    stateDef = state.stateDefinitions
    parsedType = decodeInfo.parseType(stateDef[0].attributes.type, states, 'test1', util.extractLocationFromAstVariable(stateDef[0]))
    checkDecodeInfo(st, parsedType, 0, 32, 'struct test1.str')

    state = stateDecoder.extractStateVariables('test.sol:test2', output.sources)
    checkDecodeInfo(st, parsedType, 0, 32, 'struct test1.str')

    st.end()
  })
})

function checkDecodeInfo (st, decodeInfo, storageSlots, storageBytes, typeName) {
  st.equal(decodeInfo.storageSlots, storageSlots)
  st.equal(decodeInfo.storageBytes, storageBytes)
  st.equal(decodeInfo.typeName, typeName)
}
