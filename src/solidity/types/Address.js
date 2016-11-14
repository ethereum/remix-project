'use strict'
var baseType = require('./baseType')

function Address (decoder) {
  baseType(this, decoder)
}

Address.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Address
