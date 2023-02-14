'use strict'
import tape from 'tape'
const compiler = require('solc')
const stateDecoder = require('../../src/solidity-decoder/stateDecoder')
const contracts = require('./contracts/miscContracts')
const compilerInput = require('../helpers/compilerHelper').compilerInput

tape('solidity', function (t) {
  t.test('storage location', function (st) {
    let output = compiler.compile(compilerInput(contracts))
    output = JSON.parse(output)
    let stateDec = stateDecoder.extractStateVariables('contractUint', output.sources)
    checkLocation(st, stateDec[0].storagelocation, 0, 0)
    checkLocation(st, stateDec[1].storagelocation, 1, 0)
    checkLocation(st, stateDec[2].storagelocation, 2, 0)
    checkLocation(st, stateDec[3].storagelocation, 3, 0)

    stateDec = stateDecoder.extractStateVariables('contractStructAndArray', output.sources)
    checkLocation(st, stateDec[0].storagelocation, 0, 0)
    checkLocation(st, stateDec[1].storagelocation, 2, 0)
    checkLocation(st, stateDec[2].storagelocation, 8, 0)

    stateDec = stateDecoder.extractStateVariables('contractArray', output.sources)
    checkLocation(st, stateDec[0].storagelocation, 0, 0)
    checkLocation(st, stateDec[1].storagelocation, 1, 0)
    checkLocation(st, stateDec[2].storagelocation, 2, 0)

    stateDec = stateDecoder.extractStateVariables('contractSmallVariable', output.sources)
    checkLocation(st, stateDec[0].storagelocation, 0, 0)
    checkLocation(st, stateDec[1].storagelocation, 0, 1)
    checkLocation(st, stateDec[2].storagelocation, 0, 2)
    checkLocation(st, stateDec[3].storagelocation, 0, 4)
    checkLocation(st, stateDec[4].storagelocation, 1, 0)
    checkLocation(st, stateDec[5].storagelocation, 2, 0)

    stateDec = stateDecoder.extractStateVariables('testSimpleStorage', output.sources)
    checkLocation(st, stateDec[0].storagelocation, 0, 0)
    checkLocation(st, stateDec[1].storagelocation, 1, 0)
    checkLocation(st, stateDec[2].storagelocation, 2, 0)
    checkLocation(st, stateDec[3].storagelocation, 3, 0)
    checkLocation(st, stateDec[4].storagelocation, 4, 0)
    checkLocation(st, stateDec[5].storagelocation, 8, 0)
    checkLocation(st, stateDec[6].storagelocation, 9, 0)
    checkLocation(st, stateDec[8].storagelocation, 17, 0)
    checkLocation(st, stateDec[9].storagelocation, 17, 4)
    checkLocation(st, stateDec[10].storagelocation, 17, 6)
    checkLocation(st, stateDec[11].storagelocation, 17, 7)
    checkLocation(st, stateDec[12].storagelocation, 18, 0)
    checkLocation(st, stateDec[13].storagelocation, 21, 0)

    st.end()
  })
})

function checkLocation (st, location, slot, offset) {
  st.equal(location.offset, offset)
  st.equal(location.slot, slot)
}
