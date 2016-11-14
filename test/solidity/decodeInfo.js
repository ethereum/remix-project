'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../../src/index')
var contracts = require('./contracts')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compile(contracts, 0)

    var stateDec = index.solidity.astHelper.extractStateVariables('contractUint', output.sources)
    var decodeInfo = index.solidity.decodeInfo.decode(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 1, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[4].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 16, 'bytesX')

    stateDec = index.solidity.astHelper.extractStateVariables('contractStructAndArray', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 64, 'struct')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 192, 'array')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 64, 'array')

    stateDec = index.solidity.astHelper.extractStateVariables('contractArray', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 4 * 5, 'array')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 32, 'array')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, true, 4 * 32, 'array')

    stateDec = index.solidity.astHelper.extractStateVariables('contractEnum', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 2, 'enum')

    stateDec = index.solidity.astHelper.extractStateVariables('contractSmallVariable', output.sources)
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[0].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 1, 'int')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[1].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 1, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[2].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 2, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[3].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 4, 'int')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[4].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 32, 'uint')
    decodeInfo = index.solidity.decodeInfo.decode(stateDec[5].attributes.type, stateDec)
    checkDecodeInfo(st, decodeInfo, false, 2, 'int')

    st.end()
  })
})

function checkDecodeInfo (st, decodeInfo, freeSlot, storageBytes, typeName, name) {
  st.equal(decodeInfo.needsFreeStorageSlot, freeSlot)
  st.equal(decodeInfo.storageBytes, storageBytes)
  st.equal(decodeInfo.typeName, typeName)
}
