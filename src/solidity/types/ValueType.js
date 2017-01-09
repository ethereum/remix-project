'use strict'

class ValueType {
  constructor (storageSlots, storageBytes, typeName) {
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
  }
}

module.exports = ValueType
