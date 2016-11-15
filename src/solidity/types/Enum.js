'use strict'

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
  return '<not implemented yet>'
}

module.exports = Enum
