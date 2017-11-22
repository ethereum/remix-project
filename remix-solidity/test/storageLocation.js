'use strict'
var tape = require('tape')
var compiler = require('solc')
var stateDecoder = require('../src/stateDecoder')
var contracts = require('./contracts/miscContracts')

tape('solidity', function (t) {
  t.test('storage location', function (st) {
    var output = compiler.compileStandardWrapper(compilerInput(contracts))
    output = JSON.parse(output)
    var stateDec = stateDecoder.extractStateVariables('contractUint', output.sources)
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

function compilerInput (contracts) {
  return JSON.stringify({
    language: 'Solidity',
    sources: {
      'test.sol': {
        content: contracts
      }
    },
    settings: {
      optimizer: {
        enabled: false,
        runs: 500
      }
    },
    outputSelection: {
      '*': {
        '*': [ 'metadata', 'evm.bytecode', 'abi', 'legacyAST', 'metadata', 'evm.assembly', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
      }
    }
  })
}
