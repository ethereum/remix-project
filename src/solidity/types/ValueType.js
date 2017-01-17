'use strict'
var util = require('./util')

class ValueType {
  constructor (storageSlots, storageBytes, typeName) {
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
    this.basicType = 'ValueType'
  }

  /**
    * decode the type with the @arg location from the storage
    *
    * @param {Object} location - containing offset and slot
    * @param {Object} storageContent - storageContent (storage)
    * @return {Object} - decoded value
    */
  decodeFromStorage (location, storageContent) {
    var value = util.extractHexValue(location, storageContent, this.storageBytes)
    return this.decodeValue(value)
  }

  /**
    * decode the type from the stack
    *
    * @param {Int} stackDepth - position of the type in the stack
    * @param {Array} stack - stack
    * @param {String} - memory
    * @return {Object} - decoded value
    */
  decodeFromStack (stackDepth, stack, memory) {
    if (stackDepth >= stack.length) {
      return this.decodeValue('')
    } else {
      return this.decodeValue(stack[stack.length - 1 - stackDepth].replace('0x', ''))
    }
  }

  /**
    * decode the type with the @arg offset location from the memory
    *
    * @param {Int} stackDepth - position of the type in the stack
    * @return {String} - memory
    * @return {Object} - decoded value
    */
  decodeFromMemory (offset, memory) {
    var value = memory.substr(2 * offset, 64)
    return this.decodeValue(util.extractHexByteSlice(value, this.storageBytes, 0))
  }
}

module.exports = ValueType
