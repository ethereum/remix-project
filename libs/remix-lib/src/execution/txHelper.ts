'use strict'
import { ethers } from 'ethers'

module.exports = {
  makeFullTypeDefinition: function (typeDef) {
    if (typeDef && typeDef.type.indexOf('tuple') === 0 && typeDef.components) {
      const innerTypes = typeDef.components.map((innerType) => { return this.makeFullTypeDefinition(innerType) })
      return `tuple(${innerTypes.join(',')})${this.extractSize(typeDef.type)}`
    }
    return typeDef.type
  },

  encodeParams: function (funABI, args) {
    const types = []
    if (funABI.inputs && funABI.inputs.length) {
      for (let i = 0; i < funABI.inputs.length; i++) {
        const type = funABI.inputs[i].type
        // "false" will be converting to `false` and "true" will be working
        // fine as abiCoder assume anything in quotes as `true`
        if (type === 'bool' && args[i] === 'false') {
          args[i] = false
        }
        types.push(type.indexOf('tuple') === 0 ? this.makeFullTypeDefinition(funABI.inputs[i]) : type)
        if (args.length < types.length) {
          args.push('')
        }
      }
    }

    // NOTE: the caller will concatenate the bytecode and this
    //       it could be done here too for consistency
    const abiCoder = new ethers.utils.AbiCoder()
    return abiCoder.encode(types, args)
  },

  encodeFunctionId: function (funABI) {
    if (funABI.type === 'fallback' || funABI.type === 'receive') return '0x'
    let abi = new ethers.utils.Interface([funABI])
    return abi.getSighash(funABI.name)
  },

  sortAbiFunction: function (contractabi) {
    // Check if function is constant (introduced with Solidity 0.6.0)
    const isConstant = ({stateMutability}) => stateMutability === 'view' || stateMutability === 'pure'
    // Sorts the list of ABI entries. Constant functions will appear first,
    // followed by non-constant functions. Within those t wo groupings, functions
    // will be sorted by their names.
    return contractabi.sort(function (a, b) {
      if (isConstant(a) && !isConstant(b)) {
        return 1
      } else if (isConstant(b) && !isConstant(a)) {
        return -1
      }
      // If we reach here, either a and b are both constant or both not; sort by name then
      // special case for fallback, receive and constructor function
      if (a.type === 'function' && typeof a.name !== 'undefined') {
        return a.name.localeCompare(b.name)
      } else if (a.type === 'constructor' || a.type === 'fallback' || a.type === 'receive') {
        return 1
      }
    })
  },

  getConstructorInterface: function (abi) {
    const funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'payable': false, 'outputs': [] }
    if (typeof abi === 'string') {
      try {
        abi = JSON.parse(abi)
      } catch (e) {
        console.log('exception retrieving ctor abi ' + abi)
        return funABI
      }
    }

    for (let i = 0; i < abi.length; i++) {
      if (abi[i].type === 'constructor') {
        funABI.inputs = abi[i].inputs || []
        funABI.payable = abi[i].payable
        funABI['stateMutability'] = abi[i].stateMutability
        break
      }
    }

    return funABI
  },

  serializeInputs: function (fnAbi) {
    let serialized = '('
    if (fnAbi.inputs && fnAbi.inputs.length) {
      serialized += fnAbi.inputs.map((input) => { return input.type }).join(',')
    }
    serialized += ')'
    return serialized
  },

  extractSize: function (type) {
    const size = type.match(/([a-zA-Z0-9])(\[.*\])/)
    return size ? size[2] : ''
  },

  getFunction: function (abi, fnName) {
    for (let i = 0; i < abi.length; i++) {
      const fn = abi[i]
      if (fn.type === 'function' && fnName === fn.name + '(' + fn.inputs.map((value) => {
        if (value.components) {
          let fullType = this.makeFullTypeDefinition(value)
          return fullType.replace(/tuple/g, '') // return of makeFullTypeDefinition might contain `tuple`, need to remove it cause `methodIdentifier` (fnName) does not include `tuple` keyword
        } else {
          return value.type
        }
      }).join(',') + ')') {
        return fn
      }
    }
    return null
  },

  getFallbackInterface: function (abi) {
    for (let i = 0; i < abi.length; i++) {
      if (abi[i].type === 'fallback') {
        return abi[i]
      }
    }
  },

  getReceiveInterface: function (abi) {
    for (let i = 0; i < abi.length; i++) {
      if (abi[i].type === 'receive') {
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
  },

  inputParametersDeclarationToString: function (abiinputs) {
    const inputs = (abiinputs || []).map((inp) => inp.type + ' ' + inp.name)
    return inputs.join(', ')
  }

}
