'use strict'
var ReadOnlyExplorer = require('./basicReadOnlyExplorer')
var toolTip = require('../ui/tooltip')

class NotPersistedExplorer extends ReadOnlyExplorer {
  constructor (type) {
    super(type)
    this.readonly = false
  }

  remove (path) {
    var unprefixedPath = this.removePrefix(path)
    var folderPath = path.substring(0, path.lastIndexOf('/'))
    if (this.paths[folderPath]) {
      delete this.paths[folderPath][unprefixedPath]
      delete this.files[path]
    }
    this.event.trigger('fileRemoved', [this.type + '/' + unprefixedPath])
    return true
  }

  rename (oldPath, newPath, isFolder) {
    if (isFolder) { return toolTip('folder renaming is not handled by this explorer') }
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    this.get(oldPath, (error, content) => {
      if (error) return console.log(error)
      this.remove(oldPath)
      this.set(newPath, content)
      this.event.trigger('fileRenamed', [this.type + '/' + unprefixedoldPath, this.type + '/' + unprefixednewPath, isFolder])
    })
  }

  isReadOnly (path) {
    return false
  }
}

module.exports = NotPersistedExplorer
