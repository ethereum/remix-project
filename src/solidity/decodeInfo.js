'use strict'
/**
  * Uint decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g uint256, uint32)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
  */
function Uint (type) {
  type === 'uint' ? 'uint256' : type
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
  */
function Int (type) {
  type === 'int' ? 'int256' : type
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
  */
function FixedByteArray (type) {
  return {
    needsFreeStorageSlot: false,
    storageBytes: parseInt(type.replace('bytes', '')),
    typeName: type
  }
}

/**
  * StringType decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g string storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName}
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
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, arraySize, subArray}
  */
function ArrayType (type, stateDefinitions) {
  var arraySize
  var storageBytes

  var match = type.match(/(.*)\[(.*?)\]( storage ref| storage pointer| memory| calldata)?$/)
  if (!match || match.length < 3) {
    console.log('unable to parse type ' + type)
    return null
  }

  arraySize = match[2] === '' ? 'dynamic' : parseInt(match[2])

  var underlyingType = decode(match[1], stateDefinitions)
  if (underlyingType === null) {
    console.log('unable to parse type ' + type)
    return null
  }

  if (arraySize === 'dynamic') {
    storageBytes = 32
  } else {
    storageBytes = underlyingType.storageBytes
    if (storageBytes > 32) {
      storageBytes = 32 * arraySize * Math.ceil(storageBytes / 32)
    } else {
      storageBytes = 32 * (arraySize / Math.floor(32 / storageBytes))
    }
  }

  return {
    needsFreeStorageSlot: true,
    storageBytes: storageBytes,
    typeName: type,
    arraySize: arraySize,
    underlyingType: underlyingType
  }
}

/**
  * Enum decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g enum enumDef)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, enum}
  */
function Enum (type, stateDefinitions) {
  var enumDef = getEnum(type, stateDefinitions)
  if (enumDef === null) {
    console.log('unable to retrieve decode info of ' + type)
    return null
  }
  var length = enumDef.children.length
  var storageBytes = 0
  while (length > 1) {
    length = length / 256
    storageBytes++
  }
  return {
    needsFreeStorageSlot: false,
    storageBytes: storageBytes,
    typeName: type,
    enum: enumDef
  }
}

/**
  * Struct decode the given @arg type
  *
  * @param {String} type - type given by the AST (e.g struct structDef storage ref)
  * @return {Object} returns decoded info about the current type: { needsFreeStorageSlot, storageBytes, typeName, members}
  */
function Struct (type, stateDefinitions) {
  var match = type.match(/struct (.*?)( storage ref| storage pointer| memory| calldata)?$/)
  if (!match) {
    return null
  }
  var memberDetails = getStructMembers(match[1], stateDefinitions) // type is used to extract the ast struct definition
  if (!memberDetails) return null
  return {
    needsFreeStorageSlot: true,
    storageBytes: memberDetails.storageBytes,
    typeName: type,
    members: memberDetails.members
  }
}

/**
  * retrieve enum declaration of the given @arg type
  *
  * @param {String} type - type given by the AST (e.g enum enumDef)
  * @param {Object} stateDefinitions  - all state declarations given by the AST (including struct and enum type declaration)
  * @return {Array} - containing all value declaration of the current enum type
  */
function getEnum (type, stateDefinitions) {
  for (var k in stateDefinitions) {
    var dec = stateDefinitions[k]
    if (type === 'enum ' + dec.attributes.name) {
      return dec
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
    if (dec.name === 'StructDefinition' && typeName === dec.attributes.name) {
      for (var i in dec.children) {
        var member = dec.children[i]
        var decoded = decode(member.attributes.type, stateDefinitions)
        if (!decoded) {
          console.log('unable to retrieve decode info of ' + member.attributes.type)
          return null
        }
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
  * parse the full type
  *
  * @param {String} fullType - type given by the AST (ex: uint[2] storage ref[2])
  * @return {String} returns the token type (used to instanciate the right decoder) (uint[2] storage ref[2] will return 'array', uint256 will return uintX)
  */
function typeClass (fullType) {
  if (fullType.indexOf(']') !== -1) {
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
  * @return {Object} - return the corresponding decoder or null on error
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
  var currentType = typeClass(type)
  if (currentType === null) {
    console.log('unable to retrieve decode info of ' + type)
    return null
  }
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
