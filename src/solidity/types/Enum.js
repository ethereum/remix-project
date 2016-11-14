'use strict'
var baseType = require('./baseType')

function Enum (decoder) {
  baseType(this, decoder)
  this.enum = decoder.enum
}

Enum.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Enum
