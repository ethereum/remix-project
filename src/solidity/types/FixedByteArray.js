'use strict'
var baseType = require('./baseType')

function FixedByteArray (decoder) {
  baseType(this, decoder)
}

FixedByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = FixedByteArray
