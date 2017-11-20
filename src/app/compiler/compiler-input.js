'use strict'

module.exports = (sources, opts) => {
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
      '*': {
        '*': [ 'metadata', 'evm.bytecode', 'evm.deployedBytecode', 'abi', 'legacyAST', 'metadata', 'evm.assembly', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
      }
    }
  })
}
