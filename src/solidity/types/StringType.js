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
  value = value.replace('0x', '').replace(/(..)/g, '%$1')
  var ret = {
    length: decoded.length,
    raw: decoded.value
  }
  try {
    ret.value = decodeURIComponent(value)
  } catch (e) {
    ret.error = 'Invalid UTF8 encoding'
    ret.raw = decoded.value
  }
  return ret
}

module.exports = StringType
