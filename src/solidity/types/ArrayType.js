'use strict'
var util = require('./util')
var BN = require('ethereumjs-util').BN

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
  var ret = []
  var size = null
  var slotValue = util.extractHexValue(location, storageContent, this.storageBytes)
  var currentLocation = {
    offset: 0,
    slot: location.slot
  }
  if (this.arraySize === 'dynamic') {
    size = util.toBN('0x' + slotValue)
    currentLocation.slot = util.sha3(location.slot)
  } else {
    size = new BN(this.arraySize)
  }
  var k = util.toBN(0)
  for (; k.lt(size) && k.ltn(300); k.iaddn(1)) {
    ret.push(this.underlyingType.decodeFromStorage(currentLocation, storageContent))
    if (this.underlyingType.storageSlots === 1 && location.offset + this.underlyingType.storageBytes <= 32) {
      currentLocation.offset += this.underlyingType.storageBytes
      if (currentLocation.offset + this.underlyingType.storageBytes > 32) {
        currentLocation.offset = 0
        currentLocation.slot = '0x' + util.add(currentLocation.slot, 1).toString(16)
      }
    } else {
      currentLocation.slot = '0x' + util.add(currentLocation.slot, this.underlyingType.storageSlots).toString(16)
      currentLocation.offset = 0
    }
  }
  return {
    value: ret,
    length: '0x' + size.toString(16)
  }
}

ArrayType.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length - 1 < stackHeight) {
    return []
  } else { // TODO manage decoding locals from storage
    var offset = stack[stack.length - 1 - stackHeight]
    offset = 2 * parseInt(offset, 16)
    return this.decodeFromMemory(offset, memory)
  }
}

ArrayType.prototype.decodeFromMemory = function (offset, memory) {
  var ret = []
  var length = extractLength(this, offset, memory)
  if (this.arraySize === 'dynamic') {
    offset = offset + 64
  }
  for (var k = 0; k < length; k++) {
    var contentOffset = offset
    if (this.underlyingType.typeName === 'bytes' || this.underlyingType.typeName === 'string' || this.underlyingType.typeName === 'array' || this.underlyingType.typeName === 'struct') {
      contentOffset = memory.substr(offset, 64)
      contentOffset = 2 * parseInt(contentOffset, 16)
    }
    ret.push(this.underlyingType.decodeFromMemory(contentOffset, memory))
    offset += 64
  }
  return ret
}

function extractLength (type, offset, memory) {
  var length = type.arraySize
  if (length === 'dynamic') {
    length = memory.substr(offset, 64)
    length = parseInt(length, 16)
  }
  return length
}

module.exports = ArrayType
