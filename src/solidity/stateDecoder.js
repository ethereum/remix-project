var astHelper = require('./astHelper')
var decodeInfo = require('./decodeInfo')

/**
  * decode the contract state storage
  *
  * @param {Array} storage location  - location of all state variables
  * @param {Object} storageResolver  - resolve storage queries
  * @return {Map} - decoded state variable
  */
async function decodeState (stateVars, storageResolver) {
  var ret = {}
  for (var k in stateVars) {
    var stateVar = stateVars[k]
    ret[stateVar.name] = await stateVar.type.decodeFromStorage(stateVar.storagelocation, storageResolver)
  }
  return ret
}

/**
  * return all storage location variables of the given @arg contractName
  *
  * @param {String} contractName  - name of the contract
  * @param {Object} sourcesList  - sources list
  * @return {Object} - return the location of all contract variables in the storage
  */
function extractStateVariables (contractName, sourcesList) {
  var states = astHelper.extractStatesDefinitions(sourcesList)
  if (!states[contractName]) {
    return []
  }
  var types = states[contractName].stateVariables
  var offsets = decodeInfo.computeOffsets(types, states, contractName)
  if (!offsets) {
    return [] // TODO should maybe return an error
  }
  return offsets.typesOffsets
}

/**
  * return the state of the given @a contractName as a json object
  *
  * @param {Map} storageContent  - contract storage
  * @param {astList} astList  - AST nodes of all the sources
  * @param {String} contractName  - contract for which state var should be resolved
  * @return {Map} - return the state of the contract
  */
function solidityState (storageContent, astList, contractName) {
  var stateVars = extractStateVariables(contractName, astList)
  return decodeState(stateVars, storageContent)
}

module.exports = {
  solidityState: solidityState,
  extractStateVariables: extractStateVariables,
  decodeState: decodeState
}
