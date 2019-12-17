'use strict'
const ValueType = require('./ValueType')

class Enum extends ValueType {
  constructor (enumDef) {
    let storageBytes = 0
    let length = enumDef.children.length
    while (length > 1) {
      length = length / 256
      storageBytes++
    }
    super(1, storageBytes, 'enum')
    this.enumDef = enumDef
  }

  decodeValue (value) {
    if (!value) {
      return this.enumDef.children[0].attributes.name
    } else {
      value = parseInt(value, 16)
      if (this.enumDef.children.length > value) {
        return this.enumDef.children[value].attributes.name
      } else {
        return 'INVALID_ENUM<' + value + '>'
      }
    }
  }
}

module.exports = Enum
