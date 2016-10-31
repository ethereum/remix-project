'use strict'
/**
  * Uint decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g uint256, uint32)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function Uint (type) {
  return {
    needsFreeStorageSlot: false,
    storageBytes: parseInt(type.replace('uint', '')) / 8,
    typeName: type
  }
}

/**
  * Int decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g int256, int32)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function Int (type) {
  return {
    needsFreeStorageSlot: false,
    storageBytes: parseInt(type.replace('int', '')) / 8,
    typeName: type
  }
}

/**
  * Address decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g address)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function Address (type) {
  return {
    needsFreeStorageSlot: false,
    storageBytes: 20,
    typeName: 'address'
  }
}

/**
  * Bool decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bool)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function Bool (type) {
  return {
    needsFreeStorageSlot: false,
    storageBytes: 1,
    typeName: 'bool'
  }
}

/**
  * DynamicByteArray decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bytes storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function DynamicByteArray (type) {
  return {
    needsFreeStorageSlot: true,
    storageBytes: 32,
    typeName: 'bytes'
  }
}

/**
  * FixedByteArray decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g bytes16)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function FixedByteArray (type) {
  if (type.split(' ')) {
    type = type.split(' ')[0]
  }
  return {
    needsFreeStorageSlot: false,
    storageBytes: parseInt(type.replace('bytes', '')),
    typeName: type.split(' ')[0]
  }
}

/**
  * StringType decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g string storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function StringType (type) {
  return {
    needsFreeStorageSlot: true,
    storageBytes: 32,
    typeName: 'string'
  }
}

/**
  * ArrayType decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g int256[] storage ref, int256[] storage ref[] storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder, arraySize, subArray}
  */
function ArrayType (type, stateDefinitions) {
  var arraySize
  var storageBytes

  var underlyingType = extractUnderlyingType(type)

  arraySize = extractArraySize(type)
  var dimensions = extractDimensions(type)
  type = underlyingType + dimensions.join('')

  var subArrayType = type.substring(0, type.lastIndexOf('['))
  var subArray = null
  if (subArrayType.indexOf('[') !== -1) {
    subArray = decode(subArrayType, stateDefinitions)
  }

  underlyingType = decode(underlyingType, stateDefinitions)
  storageBytes = underlyingType.storageBytes

  if (arraySize === 'dynamic') {
    storageBytes = 32
  } else {
    if (subArray) {
      storageBytes = subArray.storageBytes // size on storage of one item of the array
    }
    storageBytes = Math.ceil(storageBytes * arraySize) // size on storage of one the whole array
  }

  return {
    needsFreeStorageSlot: true,
    storageBytes: storageBytes,
    typeName: type,
    arraySize: arraySize,
    subArray: subArray
  }
}

/**
  * Enum decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g enum enumDef)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder}
  */
function Enum (type, stateDefinitions) {
  var extracted = type.split(' ')
  return {
    needsFreeStorageSlot: false,
    storageBytes: 1,
    typeName: extracted[0] + ' ' + extracted[1],
    enum: getEnum(type, stateDefinitions)
  }
}

/**
  * Struct decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g struct structDef storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, decoder, members}
  */
function Struct (type, stateDefinitions) {
  var extracted = type.split(' ')
  type = extracted[0] + ' ' + extracted[1]
  var membersDetails = getStructMembers(type, stateDefinitions)
  return {
    needsFreeStorageSlot: true,
    storageBytes: membersDetails.storageBytes,
    typeName: type,
    members: membersDetails.members
  }
}

/**
  * retrieve enum declaration of the given @arg type
  *
  * @param {String} type - type given by the AST
  * @param {Object} stateDefinitions  - all state declarations given by the AST (including struct and enum type declaration)
  * @return {Array} - containing all value declaration of the current enum type
  */
function getEnum (type, stateDefinitions) {
  for (var k in stateDefinitions) {
    var dec = stateDefinitions[k]
    if (dec.name === 'EnumDefinition' && type.indexOf('enum ' + dec.attributes.name) === 0) {
      return dec.children
    }
  }
  return null
}

/**
  * retrieve memebers declared in the given @arg tye
  *
  * @param {String} typeName - name of the struct type (e.g struct <name>)
  * @param {Object} stateDefinitions  - all state definition given by the AST (including struct and enum type declaration)
  * @return {Array} containing all members of the current struct type
  */
function getStructMembers (typeName, stateDefinitions) {
  var members = []
  var storageBytes = 0
  for (var k in stateDefinitions) {
    var dec = stateDefinitions[k]
    if (dec.name === 'StructDefinition' && typeName.indexOf('struct ' + dec.attributes.name) === 0) {
      for (var i in dec.children) {
        var member = dec.children[i]
        var decoded = decode(member.attributes.type, stateDefinitions)
        members.push(decoded)
        if (decoded.needsFreeStorageSlot) {
          storageBytes = Math.ceil(storageBytes / 32) * 32
        }
        storageBytes += decoded.storageBytes
      }
      break
    }
  }
  return {
    members: members,
    storageBytes: storageBytes
  }
}

/**
  * return the size of the current array
  *
  * @param {String} typeName - short type ( e.g uint[][4] )
  * @return {String|Int} return 'dynamic' if dynamic array | return size of the array
  */
function extractArraySize (typeName) {
  if (typeName.indexOf('[') !== -1) {
    var squareBracket = /\[([0-9]+|\s*)\]/g
    var dim = typeName.match(squareBracket)
    var size = dim[dim.length - 1]
    if (size === '[]') {
      return 'dynamic'
    } else {
      return parseInt(dim[dim.length - 1].replace('[', '').replace(']'))
    }
  }
}

/**
  * extract the underlying type
  *
  * @param {String} fullType - type given by the AST (ex: uint[2] storage ref[2])
  * @return {String} return the first part of the full type. don not keep the array declaration ( uint[2] storage ref[2] will return uint)
  */
function extractUnderlyingType (fullType) {
  var splitted = fullType.split(' ')
  if (fullType.indexOf('enum') === 0 || fullType.indexOf('struct') === 0) {
    return splitted[0] + ' ' + splitted[1]
  }
  if (splitted.length > 0) {
    fullType = splitted[0]
  }
  if (fullType[fullType.length - 1] === ']') {
    return fullType.substring(0, fullType.indexOf('['))
  }
  return fullType
}

/**
  * get the array dimensions
  *
  * @param {String} fullType - type given by the AST
  * @return {Array} containing all the dimensions and size of the array (e.g ['[3]', '[]'] )
  */
function extractDimensions (fullType) {
  var ret = []
  if (fullType.indexOf('[') !== -1) {
    var squareBracket = /\[([0-9]+|\s*)\]/g
    var dim = fullType.match(squareBracket)
    return dim
  }
  return ret
}

/**
  * parse the full type
  *
  * @param {String} fullType - type given by the AST (ex: uint[2] storage ref[2])
  * @return {String} returns the token type (used to instanciate the right decoder) (uint[2] storage ref[2] will return 'array', uint256 will return uintX)
  */
function extractTokenType (fullType) {
  if (fullType.indexOf('[') !== -1) {
    return 'array'
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
  * @param {Object} stateDefinitions - all state stateDefinitions given by the AST (including struct and enum type declaration)
  * @return {Object} - return the corresponding decoder
  */
function decode (type, stateDefinitions) {
  var decodeInfos = {
    'address': Address,
    'array': ArrayType,
    'bool': Bool,
    'bytes': DynamicByteArray,
    'bytesX': FixedByteArray,
    'enum': Enum,
    'string': StringType,
    'struct': Struct,
    'int': Int,
    'uint': Uint
  }
  var currentType = extractTokenType(type)
  return decodeInfos[currentType](type, stateDefinitions)
}

module.exports = {
  decode: decode,
  Uint: Uint,
  Address: Address,
  Bool: Bool,
  DynamicByteArray: DynamicByteArray,
  FixedByteArray: FixedByteArray,
  Int: Int,
  StringType: StringType,
  ArrayType: ArrayType,
  Enum: Enum,
  Struct: Struct
}
