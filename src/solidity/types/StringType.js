'use strict'
var baseType = require('./baseType')

function StringType (decoder) {
  baseType(this, decoder)
}

StringType.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = StringType
