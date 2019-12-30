'use strict'

module.exports = {

  /**
    * return the contract obj of the given @arg name. Uses last compilation result.
    * return null if not found
    * @param {String} name    - contract name
    * @returns contract obj and associated file: { contract, file } or null
    */
  getContract: (contractName, contracts) => {
    for (let file in contracts) {
      if (contracts[file][contractName]) {
        return { object: contracts[file][contractName], file: file }
      }
    }
    return null
  },

  /**
    * call the given @arg cb (function) for all the contracts. Uses last compilation result
    * stop visiting when cb return true
    * @param {Function} cb    - callback
    */
  visitContracts: (contracts, cb) => {
    for (let file in contracts) {
      for (let name in contracts[file]) {
        if (cb({ name: name, object: contracts[file][name], file: file })) return
      }
    }
  }

}
