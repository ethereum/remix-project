'use strict'
var baseType = require('./baseType')

function Struct (decoder) {
  baseType(this, decoder)
  this.members = decoder.members
}

Struct.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Struct
