'use strict'
let BasicFileProvider = require('./basicFileProvider')

class ReadonlyProvider extends BasicFileProvider {

  remove (path) {
    return false
  }

  rename (oldPath, newPath, isFolder) {
    return false
  }

  isReadOnly (path) {
    return true
  }
}
module.exports = ReadonlyProvider
