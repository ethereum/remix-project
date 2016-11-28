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
  var bn = new BN(value.substr(62, 2), 16)
  bn = bn.toString(2)
  if (bn[bn.length - 1] === '1') {
    var key = util.sha3(location.slot)
    var ret = ''
    var currentSlot = storageContent[key]
    key = new BN(key.replace('0x', ''), 16)
    while (currentSlot) {
      currentSlot = currentSlot.replace('0x', '')
      ret += currentSlot
      key = key.add(new BN(1))
      currentSlot = storageContent['0x' + key.toString(16)]
    }
    return '0x' + ret.replace(/(00)+$/, '')
  } else {
    var size = value.substr(value.length - 2, 2)
    return '0x' + value.substr(0, parseInt(size, 16))
  }
}

module.exports = DynamicByteArray
