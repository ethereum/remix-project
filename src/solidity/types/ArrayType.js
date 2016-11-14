'use strict'
var baseType = require('./baseType')

function ArrayType (decoder) {
  baseType(this, decoder)
  this.arraySize = decoder.arraySize
  this.subArray = decoder.subArray
}

ArrayType.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = ArrayType
