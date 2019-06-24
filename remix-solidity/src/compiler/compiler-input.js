'use strict'

module.exports = (sources, opts) => {
  const o = {
    language: 'Solidity',
    sources: sources,
    settings: {
      optimizer: {
        enabled: opts.optimize === true || opts.optimize === 1,
        runs: 200,
        details: {}
      },
      libraries: opts.libraries,
      outputSelection: {
        '*': {
          '': [ 'legacyAST', 'ast' ],
          '*': [ 'abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
        }
      }
    }
  }
  if (opts.evmVersion) {
    o.settings.evmVersion = opts.evmVersion
  }
  if (opts.language) {
    o.language = opts.language
  }
  if (opts.language === 'Yul' && o.settings.optimizer.enabled)
  {
    o.settings.optimizer.details['yul'] = true
  }
  return JSON.stringify(o)
}
