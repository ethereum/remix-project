'use strict'

var AddressType = require('./types/Address')
var ArrayType = require('./types/ArrayType')
var BoolType = require('./types/Bool')
var BytesType = require('./types/DynamicByteArray')
var BytesXType = require('./types/FixedByteArray')
var EnumType = require('./types/Enum')
var StringType = require('./types/StringType')
var StructType = require('./types/Struct')
var IntType = require('./types/Int')
var UintType = require('./types/Uint')
var MappingType = require('./types/Mapping')

/**
  * mapping decode the given @arg type
  *
  * @param {String} type - type given by the AST
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function Mapping (type) {
  return new MappingType()
}

/**
  * Uint decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g uint256, uint32)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function Uint (type) {
  type === 'uint' ? 'uint256' : type
  var storageBytes = parseInt(type.replace('uint', '')) / 8
  return new UintType(storageBytes)
}

/**
  * Int decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g int256, int32)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function Int (type) {
  type === 'int' ? 'int256' : type
  var storageBytes = parseInt(type.replace('int', '')) / 8
  return new IntType(storageBytes)
}

/**
  * Address decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g address)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function Address (type) {
  return new AddressType()
}

/**
  * Bool decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bool)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function Bool (type) {
  return new BoolType()
}

/**
  * DynamicByteArray decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bytes storage ref)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function DynamicByteArray (type) {
  return new BytesType()
}

/**
  * FixedByteArray decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bytes16)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function FixedByteArray (type) {
  var storageBytes = parseInt(type.replace('bytes', ''))
  return new BytesXType(storageBytes)
}

/**
  * StringType decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g string storage ref)
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName}
  */
function String (type) {
  return new StringType()
}

/**
  * ArrayType decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g int256[] storage ref, int256[] storage ref[] storage ref)
  * @param {Object} stateDefinitions - all state definitions given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName, arraySize, subArray}
  */
function Array (type, stateDefinitions, contractName) {
  var arraySize
  var match = type.match(/(.*)\[(.*?)\]( storage ref| storage pointer| memory| calldata)?$/)
  if (!match || match.length < 3) {
    console.log('unable to parse type ' + type)
    return null
  }
  arraySize = match[2] === '' ? 'dynamic' : parseInt(match[2])
  var underlyingType = parseType(match[1], stateDefinitions, contractName)
  if (underlyingType === null) {
    console.log('unable to parse type ' + type)
    return null
  }
  return new ArrayType(underlyingType, arraySize)
}

/**
  * Enum decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g enum enumDef)
  * @param {Object} stateDefinitions - all state definitions given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName, enum}
  */
function Enum (type, stateDefinitions, contractName) {
  var match = type.match(/enum (.*)/)
  var enumDef = getEnum(match[1], stateDefinitions, contractName)
  if (enumDef === null) {
    console.log('unable to retrieve decode info of ' + type)
    return null
  }
  return new EnumType(enumDef)
}

/**
  * Struct decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g struct structDef storage ref)
  * @param {Object} stateDefinitions - all state definitions given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Object} returns decoded info about the current type: { storageBytes, typeName, members}
  */
function Struct (type, stateDefinitions, contractName) {
  var match = type.match(/struct (.*?)( storage ref| storage pointer| memory| calldata)?$/)
  if (!match) {
    return null
  }
  var memberDetails = getStructMembers(match[1], stateDefinitions, contractName) // type is used to extract the ast struct definition
  if (!memberDetails) return null
  return new StructType(memberDetails)
}

/**
  * retrieve enum declaration of the given @arg type
  *
  * @param {String} type - type given by the AST (e.g enum enumDef)
  * @param {Object} stateDefinitions  - all state declarations given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Array} - containing all value declaration of the current enum type
  */
function getEnum (type, stateDefinitions, contractName) {
  var split = type.split('.')
  if (!split.length) {
    type = contractName + '.' + type
  } else {
    contractName = split[0]
  }
  var state = stateDefinitions[contractName]
  if (state) {
    for (var dec of state.stateDefinitions) {
      if (dec.attributes && dec.attributes.name && type === contractName + '.' + dec.attributes.name) {
        return dec
      }
    }
  }
  return null
}

/**
  * retrieve memebers declared in the given @arg tye
  *
  * @param {String} typeName - name of the struct type (e.g struct <name>)
  * @param {Object} stateDefinitions  - all state definition given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Array} containing all members of the current struct type
  */
function getStructMembers (type, stateDefinitions, contractName) {
  var split = type.split('.')
  if (!split.length) {
    type = contractName + '.' + type
  } else {
    contractName = split[0]
  }
  var state = stateDefinitions[contractName]
  if (state) {
    for (var dec of state.stateDefinitions) {
      if (dec.name === 'StructDefinition' && type === contractName + '.' + dec.attributes.name) {
        var offsets = computeOffsets(dec.children, stateDefinitions, contractName)
        return {
          members: offsets.typesOffsets,
          storageSlots: offsets.endLocation.slot
        }
      }
    }
  }
  return null
}

/**
  * parse the full type
  *
  * @param {String} fullType - type given by the AST (ex: uint[2] storage ref[2])
  * @return {String} returns the token type (used to instanciate the right decoder) (uint[2] storage ref[2] will return 'array', uint256 will return uintX)
  */
function typeClass (fullType) {
  if (fullType.indexOf(']') !== -1) {
    return 'array'
  }
  if (fullType.indexOf('mapping') === 0) {
    return 'mapping'
  }
  if (fullType.indexOf(' ') !== -1) {
    fullType = fullType.split(' ')[0]
  }
  var char = fullType.indexOf('bytes') === 0 ? 'X' : ''
  return fullType.replace(/[0-9]+/g, char)
}

/**
  * parse the type and return an object representing the type
  *
  * @param {Object} type - type name given by the ast node
  * @param {Object} stateDefinitions - all state stateDefinitions given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Object} - return the corresponding decoder or null on error
  */
function parseType (type, stateDefinitions, contractName) {
  var decodeInfos = {
    'address': Address,
    'array': Array,
    'bool': Bool,
    'bytes': DynamicByteArray,
    'bytesX': FixedByteArray,
    'enum': Enum,
    'string': String,
    'struct': Struct,
    'int': Int,
    'uint': Uint,
    'mapping': Mapping
  }
  var currentType = typeClass(type)
  if (currentType === null) {
    console.log('unable to retrieve decode info of ' + type)
    return null
  }
  return decodeInfos[currentType](type, stateDefinitions, contractName)
}

/**
  * compute offset (slot offset and byte offset of the @arg list of types)
  *
  * @param {Array} types - list of types
  * @param {Object} stateDefinitions - all state definitions given by the AST (including struct and enum type declaration) for all contracts
  * @param {String} contractName - contract the @args typeName belongs to
  * @return {Array} - return an array of types item: {name, type, location}. location defines the byte offset and slot offset
  */
function computeOffsets (types, stateDefinitions, contractName) {
  var ret = []
  var location = {
    offset: 0,
    slot: 0
  }
  for (var i in types) {
    var variable = types[i]
    var type = parseType(variable.attributes.type, stateDefinitions, contractName)
    if (!type) {
      console.log('unable to retrieve decode info of ' + variable.attributes.type)
      return null
    }
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
  if (location.offset > 0) {
    location.slot++
  }
  return {
    typesOffsets: ret,
    endLocation: location
  }
}

module.exports = {
  parseType: parseType,
  computeOffsets: computeOffsets,
  Uint: Uint,
  Address: Address,
  Bool: Bool,
  DynamicByteArray: DynamicByteArray,
  FixedByteArray: FixedByteArray,
  Int: Int,
  String: String,
  Array: Array,
  Enum: Enum,
  Struct: Struct
}
