'use strict'

class Mapping {
  constructor () {
    this.storageSlots = 1
    this.storageBytes = 32
    this.typeName = 'mapping'
  }

  decodeFromStorage (location, storageContent) {
    return '<not implemented>'
  }
}

module.exports = Mapping
