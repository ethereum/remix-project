'use strict'

import { CompilerInput, Source, CompilerInputOptions, Language } from './types'

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
          '*': ['abi', 'metadata', 'devdoc', 'userdoc', 'storageLayout', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates', 'evm.assembly']
        }
      }
    }
  }  
  if (opts.evmVersion) {
    if (opts.evmVersion.toLowerCase() == 'default') {
      opts.evmVersion = null
    } else {
      o.settings.evmVersion = opts.evmVersion
    }
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

export const Languages = ['Solidity', 'Yul']

export function getValidLanguage (val: string): Language {
  if (val !== undefined && val !== null && val) {
    const lang = val.slice(0, 1).toUpperCase() + val.slice(1).toLowerCase()
    return Languages.indexOf(lang) > -1 ? lang as Language : null
  }
  return null
}

export function compilerInputForConfigFile(sources: Source, opts)
{
  opts.sources = sources
  return JSON.stringify(opts)
}
