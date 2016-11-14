'use strict'
var baseType = require('./baseType')

function Bool (decoder) {
  baseType(this, decoder)
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Bool
