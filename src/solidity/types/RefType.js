'use strict'

class RefType {
  constructor (storageSlots, storageBytes, typeName, location) {
    this.location = location
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
    this.basicType = 'RefType'
  }

  /**
    * decode the type from the stack
    *
    * @param {Int} stackDepth - position of the type in the stack
    * @param {Array} stack - stack
    * @param {String} - memory
    * @param {Object} - storage
    * @return {Object} decoded value
    */
  decodeFromStack (stackDepth, stack, memory, storage) {
    if (stack.length - 1 < stackDepth) {
      return { error: '<decoding failed - stack underflow ' + stackDepth + '>' }
    }
    if (!storage) {
      storage = {} // TODO this is a fallback, should manage properly locals store in storage
    }
    var offset = stack[stack.length - 1 - stackDepth]
    offset = parseInt(offset, 16)
    if (this.storageStore()) {
      return this.decodeFromStorage({ offset: 0, slot: offset }, storage)
    } else if (this.memoryStore()) {
      return this.decodeFromMemoryInternal(offset, memory)
    } else {
      return { error: '<decoding failed - no decoder for ' + this.location + '>' }
    }
  }

  /**
    * decode the type from the memory
    *
    * @param {Int} offset - position of the ref of the type in memory
    * @param {String} memory - memory
    * @return {Object} decoded value
    */
  decodeFromMemory (offset, memory) {
    offset = memory.substr(2 * offset, 64)
    offset = parseInt(offset, 16)
    return this.decodeFromMemoryInternal(offset, memory)
  }

  /**
    * current type defined in storage
    *
    * @return {Bool} - return true if the type is defined in the storage
    */
  storageStore () {
    return this.location.indexOf('storage') === 0
  }

  /**
    * current type defined in memory
    *
    * @return {Bool} - return true if the type is defined in the memory
    */
  memoryStore () {
    return this.location.indexOf('memory') === 0
  }
}

module.exports = RefType
