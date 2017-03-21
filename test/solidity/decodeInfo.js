'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../../src/index')
var contracts = require('./contracts/miscContracts')
var simplecontracts = require('./contracts/simpleContract')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compile(contracts, 0)

    var state = index.solidity.astHelper.extractStateDefinitions(':contractUint', output.sources)
    var states = index.solidity.astHelper.extractStatesDefinitions(output.sources)
    var stateDef = state.stateDefinitions
    var decodeInfo = index.solidity.decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractUint')
    checkDecodeInfo(st, decodeInfo, 1, 1, 'uint8')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractUint')
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint256')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractUint')
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint256')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[4].attributes.type, states, 'contractUint')
    checkDecodeInfo(st, decodeInfo, 1, 16, 'bytes16')

    state = index.solidity.astHelper.extractStateDefinitions(':contractStructAndArray', output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractStructAndArray')
    checkDecodeInfo(st, decodeInfo, 2, 32, 'struct contractStructAndArray.structDef')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractStructAndArray')
    checkDecodeInfo(st, decodeInfo, 6, 32, 'struct contractStructAndArray.structDef[3]')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractStructAndArray')
    checkDecodeInfo(st, decodeInfo, 2, 32, 'bytes12[4]')

    state = index.solidity.astHelper.extractStateDefinitions(':contractArray', output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractArray')
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint32[5]')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractArray')
    checkDecodeInfo(st, decodeInfo, 1, 32, 'int8[]')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractArray')
    checkDecodeInfo(st, decodeInfo, 4, 32, 'int16[][3][][4]')

    state = index.solidity.astHelper.extractStateDefinitions(':contractEnum', output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractEnum')
    checkDecodeInfo(st, decodeInfo, 1, 2, 'enum')

    state = index.solidity.astHelper.extractStateDefinitions(':contractSmallVariable', output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[0].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 1, 'int8')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[1].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 1, 'uint8')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[2].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 2, 'uint16')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[3].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 4, 'int32')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[4].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint256')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[5].attributes.type, states, 'contractSmallVariable')
    checkDecodeInfo(st, decodeInfo, 1, 2, 'int16')

    output = compiler.compile(simplecontracts, 0)

    state = index.solidity.astHelper.extractStateDefinitions(':simpleContract', output.sources)
    states = index.solidity.astHelper.extractStatesDefinitions(output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[2].attributes.type, states, 'simpleContract')
    checkDecodeInfo(st, decodeInfo, 2, 32, 'struct simpleContract.structDef')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[3].attributes.type, states, 'simpleContract')
    checkDecodeInfo(st, decodeInfo, 6, 32, 'struct simpleContract.structDef[3]')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[4].attributes.type, states, 'simpleContract')
    checkDecodeInfo(st, decodeInfo, 1, 1, 'enum')

    state = index.solidity.astHelper.extractStateDefinitions(':test2', output.sources)
    stateDef = state.stateDefinitions
    decodeInfo = index.solidity.decodeInfo.parseType(stateDef[0].attributes.type, states, 'test1')
    checkDecodeInfo(st, decodeInfo, 0, 32, 'struct test1.str')

    state = index.solidity.stateDecoder.extractStateVariables(':test2', output.sources)
    checkDecodeInfo(st, decodeInfo, 0, 32, 'struct test1.str')

    st.end()
  })
})

function checkDecodeInfo (st, decodeInfo, storageSlots, storageBytes, typeName) {
  st.equal(decodeInfo.storageSlots, storageSlots)
  st.equal(decodeInfo.storageBytes, storageBytes)
  st.equal(decodeInfo.typeName, typeName)
}
