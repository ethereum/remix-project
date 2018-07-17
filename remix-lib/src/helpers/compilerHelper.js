module.exports = {
  compilerInput: compilerInput
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
        runs: 200
      },
      outputSelection: {
        '*': {
          '': [ 'legacyAST' ],
          '*': [ 'abi', 'metadata', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
        }
      }
    }
  })
}
