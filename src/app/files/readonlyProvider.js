'use strict'
var ReadonlyProvider = require('./basicFileProvider')

class ReadonlyProvider extends BasicFileProvider {
  constructor (type) {
    super(type)
  }

  remove (path) {
    return false
  }

  rename (oldPath, newPath, isFolder) {
  }

  isReadOnly (path) {
    return true
  }

module.exports = ReadonlyProvider
