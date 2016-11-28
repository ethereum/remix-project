'use strict'
var DynamicBytes = require('./DynamicByteArray')

function StringType () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'string'
  this.dynamicBytes = new DynamicBytes()
}

StringType.prototype.decodeFromStorage = function (location, storageContent) {
  var decoded = this.dynamicBytes.decodeFromStorage(location, storageContent)
  var value = decoded.value
  var ret = ''
  value = value.replace('0x', '')
  for (var k = 0; k < value.length; k += 2) {
    var raw = value.substr(k, 2)
    var str = String.fromCharCode(parseInt(raw, 16))
    ret += str
  }
  return {
    value: ret,
    length: decoded.length
  }
}

module.exports = StringType
