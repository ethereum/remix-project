'use strict'
var baseType = require('./baseType')

function Int (decoder) {
  baseType(this, decoder)
}

Int.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Int
