'use strict'

import { CompilationResult, visitContractsCallbackParam, visitContractsCallbackInterface } from './types'
export default {

  /**
   * @dev Get contract obj of given contract name from last compilation result.
   * @param name contract name
   * @param contracts 'contracts' object from last compilation result
   */

  getContract: (contractName: string, contracts: CompilationResult['contracts']) : Record<string, any> | null => {
    for (const file in contracts) {
      if (contracts[file][contractName]) {
        return { object: contracts[file][contractName], file: file }
      }
    }
    return null
  },

  /**
   * @dev call the given callback for all contracts from last compilation result, stop visiting when cb return true
   * @param contracts - 'contracts' object from last compilation result
   * @param cb    - callback
   */

  visitContracts: (contracts: CompilationResult['contracts'], cb: visitContractsCallbackInterface) : void => {
    for (const file in contracts) {
      for (const name in contracts[file]) {
        const param: visitContractsCallbackParam = {
          name: name,
          object: contracts[file][name],
          file: file
        }
        if (cb(param)) return
      }
    }
  }

}
