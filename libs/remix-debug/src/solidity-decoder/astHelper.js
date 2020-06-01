'use strict'
const remixLib = require('remix-lib')
const AstWalker = remixLib.AstWalker

/**
  * return all contract definitions of the given @astList
  *
  * @param {Object} sourcesList - sources list (containing root AST node)
  * @return {Object} - returns a mapping from AST node ids to AST nodes for the contracts
  */
function extractContractDefinitions (sourcesList) {
  const ret = {
    contractsById: {},
    contractsByName: {},
    sourcesByContract: {}
  }
  const walker = new AstWalker()
  for (let k in sourcesList) {
    walker.walk(sourcesList[k].legacyAST, { 'ContractDefinition': (node) => {
      ret.contractsById[node.id] = node
      ret.sourcesByContract[node.id] = k
      ret.contractsByName[k + ':' + node.attributes.name] = node
      return false
    }})
  }
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
  * @param {Object} [contracts] - map of contract definitions (contains contractsById, contractsByName)
  * @return {Object} - return an object containing: stateItems - list of all the children node of the @arg contractName
  *                                                 stateVariables - list of all the variable declaration of the @arg contractName
  */
function extractStateDefinitions (contractName, sourcesList, contracts) {
  if (!contracts) {
    contracts = extractContractDefinitions(sourcesList)
  }
  const node = contracts.contractsByName[contractName]
  if (node) {
    const stateItems = []
    const stateVar = []
    const baseContracts = getLinearizedBaseContracts(node.id, contracts.contractsById)
    baseContracts.reverse()
    for (let k in baseContracts) {
      const ctr = baseContracts[k]
      for (let i in ctr.children) {
        const item = ctr.children[i]
        stateItems.push(item)
        if (item.name === 'VariableDeclaration') {
          stateVar.push(item)
        }
      }
    }
    return {
      stateDefinitions: stateItems,
      stateVariables: stateVar
    }
  }
  return null
}

/**
  * return state var and type definition of all the contracts from the given @args sourcesList
  *
  * @param {Object} sourcesList - sources list (containing root AST node)
  * @param {Object} [contracts] - map of contract definitions (contains contractsById, contractsByName)
  * @return {Object} - returns a mapping between contract name and contract state
  */
function extractStatesDefinitions (sourcesList, contracts) {
  if (!contracts) {
    contracts = extractContractDefinitions(sourcesList)
  }
  const ret = {}
  for (let contract in contracts.contractsById) {
    const name = contracts.contractsById[contract].attributes.name
    const source = contracts.sourcesByContract[contract]
    const fullName = source + ':' + name
    const state = extractStateDefinitions(fullName, sourcesList, contracts)
    ret[fullName] = state
    ret[name] = state // solc < 0.4.9
  }
  return ret
}

module.exports = {
  extractStatesDefinitions: extractStatesDefinitions,
  extractStateDefinitions: extractStateDefinitions,
  extractContractDefinitions: extractContractDefinitions,
  getLinearizedBaseContracts: getLinearizedBaseContracts
}
