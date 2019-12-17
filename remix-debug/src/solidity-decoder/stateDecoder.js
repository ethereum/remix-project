const astHelper = require('./astHelper')
const decodeInfo = require('./decodeInfo')

/**
  * decode the contract state storage
  *
  * @param {Array} storage location  - location of all state variables
  * @param {Object} storageResolver  - resolve storage queries
  * @return {Map} - decoded state variable
  */
async function decodeState (stateVars, storageResolver) {
  const ret = {}
  for (var k in stateVars) {
    const stateVar = stateVars[k]
    try {
      const decoded = await stateVar.type.decodeFromStorage(stateVar.storagelocation, storageResolver)
      decoded.constant = stateVar.constant
      if (decoded.constant) {
        decoded.value = '<constant>'
      }
      ret[stateVar.name] = decoded
    } catch (e) {
      console.log(e)
      ret[stateVar.name] = '<decoding failed - ' + e.message + '>'
    }
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
  const states = astHelper.extractStatesDefinitions(sourcesList)
  if (!states[contractName]) {
    return []
  }
  const types = states[contractName].stateVariables
  const offsets = decodeInfo.computeOffsets(types, states, contractName, 'storage')
  if (!offsets) {
    return [] // TODO should maybe return an error
  }
  return offsets.typesOffsets
}

/**
  * return the state of the given @a contractName as a json object
  *
  * @param {Object} storageResolver  - resolve storage queries
  * @param {astList} astList  - AST nodes of all the sources
  * @param {String} contractName  - contract for which state var should be resolved
  * @return {Map} - return the state of the contract
  */
async function solidityState (storageResolver, astList, contractName) {
  const stateVars = extractStateVariables(contractName, astList)
  try {
    return await decodeState(stateVars, storageResolver)
  } catch (e) {
    return '<decoding failed - ' + e.message + '>'
  }
}

module.exports = {
  solidityState: solidityState,
  extractStateVariables: extractStateVariables,
  decodeState: decodeState
}
