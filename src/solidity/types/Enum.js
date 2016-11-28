'use strict'
var util = require('./util')

function Enum (enumDef) {
  this.enumDef = enumDef
  this.typeName = 'enum'
  this.storageSlots = 1
  var length = enumDef.children.length
  this.storageBytes = 0
  while (length > 1) {
    length = length / 256
    this.storageBytes++
  }
}

Enum.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  value = parseInt(value, 16)
  if (this.enumDef.children.length > value) {
    return this.enumDef.children[value].attributes.name
  } else {
    return 'INVALID_ENUM<' + value + '>'
  }
}

module.exports = Enum
