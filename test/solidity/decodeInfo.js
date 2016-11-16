'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../../src/index')
var contracts = require('./contracts')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compile(contracts, 0)

    var stateDec = index.solidity.astHelper.extractState('contractUint', output.sources).stateItems
    var decodeInfo = index.solidity.decodeInfo.parseType(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 1, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[4].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 16, 'bytesX')

    stateDec = index.solidity.astHelper.extractState('contractStructAndArray', output.sources).stateItems
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 2, 32, 'struct')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 6, 32, 'array')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 2, 32, 'array')

    stateDec = index.solidity.astHelper.extractState('contractArray', output.sources).stateItems
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 32, 'array')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 32, 'array')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 4, 32, 'array')

    stateDec = index.solidity.astHelper.extractState('contractEnum', output.sources).stateItems
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 2, 'enum')

    stateDec = index.solidity.astHelper.extractState('contractSmallVariable', output.sources).stateItems
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 1, 'int')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 1, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 2, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 4, 'int')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[4].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.parseType(stateDec[5].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, 1, 2, 'int')

    st.end()
  })
})

function checkDecodeInfo (st, decodeInfo, storageSlots, storageBytes, typeName) {
  st.equal(decodeInfo.storageSlots, storageSlots)
  st.equal(decodeInfo.storageBytes, storageBytes)
  st.equal(decodeInfo.typeName, typeName)
}
