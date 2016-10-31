'use strict'
var AstWalker = require('../util/astWalker')

/**
  * return all contract definitions of the given @astList
  *
  * @param {Object} sourcesList - sources list (containing root AST node)
  * @return {Object} - returns a mapping from AST node ids to AST nodes for the contracts
  */
function extractContractDefinitions (sourcesList) {
  var ret = {
    contractsById: {},
    contractsByName: {}
  }
  var walker = new AstWalker()
  walker.walkAstList(sourcesList, { 'ContractDefinition': function (node) {
    ret.contractsById[node.id] = node
    ret.contractsByName[node.attributes.name] = node
    return false
  }})
  return ret
}

/**
  * returns the linearized base contracts of the contract @arg id
  *
  * @param {Int} id - contract id to resolve
  * @param {Map} contracts  - all contracts defined in the current context
  * @return {Array} - array of base contracts in derived to base order as AST nodes.
  */
function getLinearizedBaseContracts (id, contractsById) {
  return contractsById[id].attributes.linearizedBaseContracts.map(function (id) { return contractsById[id] })
}

/**
  * return state var and type definition of the given contract
  *
  * @param {String} contractName - contract for which state var should be resolved
  * @param {Object} sourcesList - sources list (containing root AST node)
  * @return {Array} - return an array of AST node of all state variables (including inherited) (this will include all enum/struct declarations)
  */
function extractStateVariables (contractName, sourcesList) {
  var contracts = extractContractDefinitions(sourcesList)
  var node = contracts.contractsByName[contractName]
  if (node) {
    var stateVar = []
    var baseContracts = getLinearizedBaseContracts(node.id, contracts.contractsById)
    baseContracts.reverse()
    for (var k in baseContracts) {
      var ctr = baseContracts[k]
      for (var i in ctr.children) {
        stateVar.push(ctr.children[i])
      }
    }
    return stateVar
  }
  return null
}

module.exports = {
  extractStateVariables: extractStateVariables,
  extractContractDefinitions: extractContractDefinitions,
  getLinearizedBaseContracts: getLinearizedBaseContracts
}
