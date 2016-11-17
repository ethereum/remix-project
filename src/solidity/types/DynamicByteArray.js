'use strict'
var util = require('./util')
var BN = require('ethereumjs-util').BN

function DynamicByteArray () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'bytes'
}

DynamicByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractValue(location, storageContent, this.storageBytes)
  var key = util.dynamicTypePointer(location)
  if (storageContent[key] && storageContent[key] !== '0x') {
    var ret = ''
    var length = parseInt(value) - 1
    var slots = Math.ceil(length / 64)
    var currentSlot = storageContent[key]
    key = new BN(key.replace('0x', ''), 16)
    for (var k = 0; k < slots; k++) {
      if (!currentSlot) {
        break
      }
      ret += currentSlot.replace('0x', '')
      key = key.add(new BN(1))
      currentSlot = storageContent['0x' + key.toString(16)]
    }
    return ret.substr(0, length)
  } else {
    var size = value.substr(value.length - 2, 2)
    return value.substr(0, parseInt(size, 16) + 2)
  }
}

module.exports = DynamicByteArray
