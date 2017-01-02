'use strict'
var tape = require('tape')
var compiler = require('solc')
var index = require('../../babelify-src/index')
var contracts = require('./contracts/miscContracts')

tape('solidity', function (t) {
  t.test('storage location', function (st) {
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

    stateDec = index.solidity.stateDecoder.extractStateVariables('testSimpleStorage', output.sources)
    checkLocation(st, stateDec[0].location, 0, 0)
    checkLocation(st, stateDec[1].location, 1, 0)
    checkLocation(st, stateDec[2].location, 2, 0)
    checkLocation(st, stateDec[3].location, 3, 0)
    checkLocation(st, stateDec[4].location, 4, 0)
    checkLocation(st, stateDec[5].location, 8, 0)
    checkLocation(st, stateDec[6].location, 9, 0)
    checkLocation(st, stateDec[8].location, 17, 0)
    checkLocation(st, stateDec[9].location, 17, 4)
    checkLocation(st, stateDec[10].location, 17, 6)
    checkLocation(st, stateDec[11].location, 17, 7)
    checkLocation(st, stateDec[12].location, 18, 0)
    checkLocation(st, stateDec[13].location, 21, 0)

    st.end()
  })
})

function checkLocation (st, location, slot, offset) {
  st.equal(location.offset, offset)
  st.equal(location.slot, slot)
}

