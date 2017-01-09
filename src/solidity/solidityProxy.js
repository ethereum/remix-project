'use strict'
var traceHelper = require('../helpers/traceHelper')
var stateDecoder = require('./stateDecoder')
var astHelper = require('./astHelper')

class SolidityProxy {
  constructor (traceManager, codeManager) {
    this.cache = new Cache()
    this.reset({})
    this.traceManager = traceManager
    this.codeManager = codeManager
  }

  /**
    * reset the cache and apply a new @arg compilationResult
    *
    * @param {Object} compilationResult  - result os a compilatiion (diectly returned by the compiler)
    */
  reset (compilationResult) {
    this.sources = compilationResult.sources
    this.sourceList = compilationResult.sourceList
    this.contracts = compilationResult.contracts
    this.cache.reset()
  }

  /**
    * check if the object has been properly loaded
    *
    * @return {Bool} - returns true if a compilation result has been applied
    */
  loaded () {
    return this.contracts !== undefined
  }

  /**
    * retrieve the compiled contract name at the @arg vmTraceIndex (cached)
    *
    * @param {Int} vmTraceIndex  - index in the vm trave where to resolve the executed contract name
    * @param {Function} cb  - callback returns (error, contractName)
    */
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

  /**
    * extract the state variables of the given compiled @arg contractName (cached)
    *
    * @param {String} contractName  - name of the contract to retrieve state variables from
    * @return {Object} - returns state variables of @args contractName
    */
  extractStatesDefinitions () {
    if (!this.cache.contractDeclarations) {
      this.cache.contractDeclarations = astHelper.extractContractDefinitions(this.sources)
    }
    if (!this.cache.statesDefinitions) {
      this.cache.statesDefinitions = astHelper.extractStatesDefinitions(this.sources, this.cache.contractDeclarations)
    }
    return this.cache.statesDefinitions
  }

  /**
    * extract the state variables of the given compiled @arg contractName (cached)
    *
    * @param {String} contractName  - name of the contract to retrieve state variables from
    * @return {Object} - returns state variables of @args contractName
    */
  extractStateVariables (contractName) {
    if (!this.cache.stateVariablesByContractName[contractName]) {
      this.cache.stateVariablesByContractName[contractName] = stateDecoder.extractStateVariables(contractName, this.sources)
    }
    return this.cache.stateVariablesByContractName[contractName]
  }

  /**
    * extract the state variables of the given compiled @arg vmtraceIndex (cached)
    *
    * @param {Int} vmTraceIndex  - index in the vm trave where to resolve the state variables
    * @return {Object} - returns state variables of @args vmTraceIndex
    */
  extractStateVariablesAt (vmtraceIndex, cb) {
    this.contractNameAt(vmtraceIndex, (error, contractName) => {
      if (error) {
        cb(error)
      } else {
        cb(null, this.extractStateVariables(contractName))
      }
    })
  }

  /**
    * get the AST of the file declare in the @arg sourceLocation
    *
    * @param {Object} sourceLocation  - source location containing the 'file' to retrieve the AST from
    * @return {Object} - AST of the current file
    */
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
    this.contractDeclarations = null
    this.statesDefinitions = null
  }
}

module.exports = SolidityProxy
