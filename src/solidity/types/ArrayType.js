'use strict'

function ArrayType (underlyingType, arraySize) {
  this.typeName = 'array'
  this.storageBytes = 32
  this.underlyingType = underlyingType
  this.arraySize = arraySize
  this.storageSlots = null
  if (arraySize === 'dynamic') {
    this.storageSlots = 1
  } else {
    if (underlyingType.storageBytes < 32) {
      var itemPerSlot = Math.floor(32 / underlyingType.storageBytes)
      this.storageSlots = Math.ceil(arraySize / itemPerSlot)
    } else {
      this.storageSlots = arraySize * underlyingType.storageSlots
    }
  }
}

ArrayType.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = ArrayType
