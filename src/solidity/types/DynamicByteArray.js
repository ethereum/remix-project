'use strict'
var baseType = require('./baseType')

function DynamicByteArray (decoder) {
  baseType(this, decoder)
}

DynamicByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = DynamicByteArray
