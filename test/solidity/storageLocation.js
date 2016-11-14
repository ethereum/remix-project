'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../../src/index')
var contracts = require('./contracts')

tape('solidity', function (t) {
  t.test('astHelper, decodeInfo', function (st) {
    var output = compiler.compile(contracts, 0)
    var stateDec = index.solidity.stateDecoder.extractStateVariables('contractUint', output.sources)
    checkLocation(st, stateDec[0].location, 0, 0)
    checkLocation(st, stateDec[1].location, 1, 0)
    checkLocation(st, stateDec[2].location, 2, 0)
    checkLocation(st, stateDec[3].location, 3, 0)

    stateDec = index.solidity.stateDecoder.extractStateVariables('contractStructAndArray', output.sources)
    checkLocation(st, stateDec[0].location, 0, 0)
    checkLocation(st, stateDec[1].location, 2, 0)
    checkLocation(st, stateDec[2].location, 8, 0)

    stateDec = index.solidity.stateDecoder.extractStateVariables('contractArray', output.sources)
    checkLocation(st, stateDec[0].location, 0, 0)
    checkLocation(st, stateDec[1].location, 1, 0)
    checkLocation(st, stateDec[2].location, 2, 0)

    stateDec = index.solidity.stateDecoder.extractStateVariables('contractSmallVariable', output.sources)
    checkLocation(st, stateDec[0].location, 0, 0)
    checkLocation(st, stateDec[1].location, 0, 1)
    checkLocation(st, stateDec[2].location, 0, 2)
    checkLocation(st, stateDec[3].location, 0, 4)
    checkLocation(st, stateDec[4].location, 1, 0)
    checkLocation(st, stateDec[5].location, 2, 0)

    st.end()
  })
})

function checkLocation (st, location, slot, offset) {
  st.equal(location.offset, offset)
  st.equal(location.slot, slot)
}

