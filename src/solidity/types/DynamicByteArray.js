'use strict'
var util = require('./util')
var BN = require('ethereumjs-util').BN

function DynamicByteArray () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'bytes'
}

DynamicByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexByte(location, storageContent, this.storageBytes)
  var key = util.sha3(location.slot)
  if (storageContent[key] && storageContent[key] !== '0x') {
    var ret = ''
    var currentSlot = storageContent[key]
    key = new BN(key.replace('0x', ''), 16)
    var regex = /(00)+$/
    while (currentSlot) {
      currentSlot = currentSlot.replace('0x', '').replace(regex, '')
      ret += currentSlot
      key = key.add(new BN(1))
      currentSlot = storageContent['0x' + key.toString(16)]
    }
    return '0x' + ret
  } else {
    var size = value.substr(value.length - 2, 2)
    return '0x' + value.substr(0, parseInt(size, 16))
  }
}

module.exports = DynamicByteArray
