'use strict'
var baseType = require('./baseType')

function Uint (decoder) {
  baseType(this, decoder)
}

Uint.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Uint
