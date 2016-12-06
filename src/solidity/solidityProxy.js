'use strict'
var traceHelper = require('../helpers/traceHelper')
var stateDecoder = require('./stateDecoder')

class SolidityProxy {
  constructor (traceManager, codeManager) {
    this.cache = new Cache()
    this.reset({})
    this.traceManager = traceManager
    this.codeManager = codeManager
  }

  reset (compilationResult) {
    this.sources = compilationResult.sources
    this.sourceList = compilationResult.sourceList
    this.contracts = compilationResult.contracts
    this.cache.reset()
  }

  loaded () {
    return this.contracts !== undefined
  }

  contractNameAt (vmTraceIndex, cb) {
    this.traceManager.getCurrentCalledAddressAt(vmTraceIndex, (error, address) => {
      if (error) {
        cb(error)
      } else {
        if (this.cache.contractNameByAddress[address]) {
          cb(null, this.cache.contractNameByAddress[address])
        } else {
          this.codeManager.getCode(address, (error, code) => {
            if (error) {
              cb(error)
            } else {
              var contractName = contractNameFromCode(this.contracts, code.bytecode, address)
              this.cache.contractNameByAddress[address] = contractName
              cb(null, contractName)
            }
          })
        }
      }
    })
  }

  extractStateVariables (contractName) {
    if (!this.cache.stateVariablesByContractName[contractName]) {
      this.cache.stateVariablesByContractName[contractName] = stateDecoder.extractStateVariables(contractName, this.sources)
    }
    return this.cache.stateVariablesByContractName[contractName]
  }

  extractStateVariablesAt (vmtraceIndex, cb) {
    this.contractNameAt(vmtraceIndex, (error, contractName) => {
      if (error) {
        cb(error)
      } else {
        cb(null, this.extractStateVariables(contractName))
      }
    })
  }

  ast (sourceLocation) {
    var file = this.sourceList[sourceLocation.file]
    return this.sources[file].AST
  }
}

function contractNameFromCode (contracts, code, address) {
  var isCreation = traceHelper.isContractCreation(address)
  var byteProp = isCreation ? 'bytecode' : 'runtimeBytecode'
  for (var k in contracts) {
    if ('0x' + contracts[k][byteProp] === code) {
      return k
    }
  }
  return null
}

class Cache {
  constructor () {
    this.reset()
  }
  reset () {
    this.contractNameByAddress = {}
    this.stateVariablesByContractName = {}
  }
}

module.exports = SolidityProxy
