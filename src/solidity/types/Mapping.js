'use strict'
var RefType = require('./RefType')

class Mapping extends RefType {
  constructor () {
    super(1, 32, 'mapping', 'storage')
  }

  async decodeFromStorage (location, storageContent) {
    return {
      value: '<not implemented>',
      length: '0x',
      type: this.typeName
    }
  }

  decodeFromMemoryInternal (offset, memory) {
    return {
      value: '<not implemented>',
      length: '0x',
      type: this.typeName
    }
  }
}

module.exports = Mapping
