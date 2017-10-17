'use strict'

module.exports = (sources, opts) => {
  var target = opts.target ? opts.target : '*'
  return JSON.stringify({
    language: 'Solidity',
    sources: sources,
    settings: {
      optimizer: {
        enabled: opts.optimize === true,
        runs: 500
      }
    },
    libraries: opts.libraries,
    outputSelection: {
      [target]: {
        '*': [ 'metadata', 'evm.bytecode', 'evm.deployedBytecode', 'abi', 'legacyAST', 'metadata', 'evm.assembly', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
      }
    }
  })
}
