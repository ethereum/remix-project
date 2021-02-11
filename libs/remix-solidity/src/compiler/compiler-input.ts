'use strict'

import { CompilerInput, Source, CompilerInputOptions } from './types'

export default (sources: Source, opts: CompilerInputOptions): string => {
  const o: CompilerInput = {
    language: 'Solidity',
    sources: sources,
    settings: {
      optimizer: {
        enabled: opts.optimize === true || opts.optimize === 1,
        runs: opts.runs || 200
      },
      libraries: opts.libraries,
      outputSelection: {
        '*': {
          '': ['ast'],
          '*': ['abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates', 'evm.assembly']
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
  if (opts.language === 'Yul' && o.settings.optimizer.enabled) {
    if (!o.settings.optimizer.details) { o.settings.optimizer.details = {} }
    o.settings.optimizer.details.yul = true
  }
  return JSON.stringify(o)
}
