'use strict'
import { ValueType } from './ValueType'

export class Enum extends ValueType {
  enumDef

  constructor (enumDef) {
    let storageBytes = 0
    let length = enumDef.members.length
    while (length > 1) {
      length = length / 256
      storageBytes++
    }
    super(1, storageBytes, 'enum')
    this.enumDef = enumDef
  }

  decodeValue (value) {
    if (!value) {
      return this.enumDef.members[0].name
    }
    value = parseInt(value, 16)
    if (this.enumDef.members.length > value) {
      return this.enumDef.members[value].name
    }
    return 'INVALID_ENUM<' + value + '>'
  }
}
