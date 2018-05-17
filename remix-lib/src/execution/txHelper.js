'use strict'
var ethers = require('ethers')

module.exports = {
  makeFullTupleTypeDefinition: function (typeDef) {
    if (typeDef && typeDef.type === 'tuple' && typeDef.components) {
      var innerTypes = typeDef.components.map((innerType) => innerType.type)
      return 'tuple(' + innerTypes.join(',') + ')'
    }
    return typeDef.type
  },

  encodeParams: function (funABI, args) {
    var types = []
    if (funABI.inputs && funABI.inputs.length) {
      for (var i = 0; i < funABI.inputs.length; i++) {
        var type = funABI.inputs[i].type
        types.push(type === 'tuple' ? this.makeFullTupleTypeDefinition(funABI.inputs[i]) : type)
        if (args.length < types.length) {
          args.push('')
        }
      }
    }

    // NOTE: the caller will concatenate the bytecode and this
    //       it could be done here too for consistency
    var abiCoder = new ethers.utils.AbiCoder()
    return abiCoder.encode(types, args)
  },

  encodeFunctionId: function (funABI) {
    if (funABI.type === 'fallback') return '0x'
    var abi = new ethers.Interface([funABI])
    abi = abi.functions[funABI.name]
    return abi.sighash
  },

  sortAbiFunction: function (contractabi) {
    // Sorts the list of ABI entries. Constant functions will appear first,
    // followed by non-constant functions. Within those t wo groupings, functions
    // will be sorted by their names.
    return contractabi.sort(function (a, b) {
      if (a.constant === true && b.constant !== true) {
        return 1
      } else if (b.constant === true && a.constant !== true) {
        return -1
      }
      // If we reach here, either a and b are both constant or both not; sort by name then
      // special case for fallback and constructor
      if (a.type === 'function' && typeof a.name !== 'undefined') {
        return a.name.localeCompare(b.name)
      } else if (a.type === 'constructor' || a.type === 'fallback') {
        return 1
      }
    })
  },

  getConstructorInterface: function (abi) {
    var funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'outputs': [] }
    if (typeof abi === 'string') {
      try {
        abi = JSON.parse(abi)
      } catch (e) {
        console.log('exception retrieving ctor abi ' + abi)
        return funABI
      }
    }

    for (var i = 0; i < abi.length; i++) {
      if (abi[i].type === 'constructor') {
        funABI.inputs = abi[i].inputs || []
        break
      }
    }

    return funABI
  },

  getFunction: function (abi, fnName) {
    for (var i = 0; i < abi.length; i++) {
      if (abi[i].name === fnName) {
        return abi[i]
      }
    }
    return null
  },

  getFallbackInterface: function (abi) {
    for (var i = 0; i < abi.length; i++) {
      if (abi[i].type === 'fallback') {
        return abi[i]
      }
    }
  },

  /**
    * return the contract obj of the given @arg name. Uses last compilation result.
    * return null if not found
    * @param {String} name    - contract name
    * @returns contract obj and associated file: { contract, file } or null
    */
  getContract: (contractName, contracts) => {
    for (var file in contracts) {
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
    for (var file in contracts) {
      for (var name in contracts[file]) {
        if (cb({ name: name, object: contracts[file][name], file: file })) return
      }
    }
  },

  inputParametersDeclarationToString: function (abiinputs) {
    var inputs = (abiinputs || []).map((inp) => inp.type + ' ' + inp.name)
    return inputs.join(', ')
  }

}

