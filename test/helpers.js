'use strict'

module.exports = {
  compilerInput: (contracts) => {
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

}
