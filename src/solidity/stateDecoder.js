var astHelper = require('./astHelper')
var decodeInfo = require('./decodeInfo')

/**
  * decode the contract state storage
  *
  * @param {Array} storage location  - location of all state variables
  * @param {Map} storageContent  - storage
  * @return {Map} - decoded state variable
  */
function decodeState (stateVars, storageContent) {
  if (storageContent['0x']) {
    storageContent['0x00'] = storageContent['0x']
    storageContent['0x'] = undefined
  }
  var ret = {}
  for (var k in stateVars) {
    var stateVar = stateVars[k]
    ret[stateVar.name] = stateVar.type.decodeFromStorage(stateVar.location, storageContent)
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
  var stateDefinitions = astHelper.extractStateVariables(contractName, sourcesList)
  var ret = []
  if (!stateDefinitions) {
    return ret
  }
  var location = {
    offset: 0,
    slot: 0
  }
  for (var k in stateDefinitions) {
    var variable = stateDefinitions[k]
    if (variable.name === 'VariableDeclaration') {
      var decoded = decodeInfo.parseType(variable.attributes.type, stateDefinitions)
      var type = new types[decoded.typeName](decoded)
      if (location.offset + type.storageBytes > 32) {
        location.slot++
        location.offset = 0
      }
      ret.push({
        name: variable.attributes.name,
        type: type,
        location: {
          offset: location.offset,
          slot: location.slot
        }
      })
      if (type.storageSlots === 1 && location.offset + type.storageBytes <= 32) {
        location.offset += type.storageBytes
      } else {
        location.slot += type.storageSlots
        location.offset = 0
      }
    }
  }
  return ret
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

var types = {
  'address': require('./types/Address'),
  'array': require('./types/ArrayType'),
  'bool': require('./types/Bool'),
  'bytes': require('./types/DynamicByteArray'),
  'bytesX': require('./types/FixedByteArray'),
  'enum': require('./types/Enum'),
  'string': require('./types/StringType'),
  'struct': require('./types/Struct'),
  'int': require('./types/Int'),
  'uint': require('./types/Uint')
}
