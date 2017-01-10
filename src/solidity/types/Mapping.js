'use strict'
var RefType = require('./RefType')

class Mapping extends RefType {
  constructor () {
    super(1, 32, 'mapping')
  }

  decodeValue (value) {
    return '<not implemented>'
  }
}

module.exports = Mapping
