'use strict'
var EventManager = require('remix-lib').EventManager

class BasicReadOnlyExplorer {
  constructor (type) {
    this.event = new EventManager()
    this.files = {}
    this.paths = {}
    this.normalizedNames = {} // contains the raw url associated with the displayed path
    this.paths[type] = {}
    this.type = type
    this.readonly = true
  }

  close (cb) {
    this.files = {}
    cb()
  }

  init (cb) {
    this.files = {}
  }

  exists (path) {
    if (!this.files) return false
    return this.files[path] !== undefined
  }

  get (path, cb) {
    var content = this.files[path]
    if (!content) {
      content = this.files[this.type + '/' + this.normalizedNames[path]]
    }
    if (cb) {
      cb(null, content)
    }
    return content
  }

  set (path, content, cb) {
    var unprefixedPath = this.removePrefix(path)
    this.addReadOnly(unprefixedPath, content)
    if (cb) cb()
    return true
  }

  addReadOnly (path, content, rawPath) {
    try { // lazy try to format JSON
      content = JSON.stringify(JSON.parse(content), null, '\t')
    } catch (e) {}
    // splitting off the path in a tree structure, the json tree is used in `resolveDirectory`
    var split = path
    var folder = false
    while (split.lastIndexOf('/') !== -1) {
      var subitem = split.substring(split.lastIndexOf('/'))
      split = split.substring(0, split.lastIndexOf('/'))
      if (!this.paths[this.type + '/' + split]) {
        this.paths[this.type + '/' + split] = {}
      }
      this.paths[this.type + '/' + split][split + subitem] = { isDirectory: folder }
      folder = true
    }
    this.paths[this.type][split] = { isDirectory: folder }
    this.files[path] = content
    this.normalizedNames[rawPath] = path
    this.event.trigger('fileAdded', [path, true])
    return true
  }

  isReadOnly (path) {
    return true
  }

  remove (path) {
    delete this.files[path]
  }

  rename (oldPath, newPath, isFolder) {
    return true
  }

  list () {
    return this.files
  }

  resolveDirectory (path, callback) {
    var self = this
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [self.type]: { } })
    // we just return the json tree populated by `addReadOnly`
    callback(null, this.paths[path])
  }

  removePrefix (path) {
    return path.indexOf(this.type + '/') === 0 ? path.replace(this.type + '/', '') : path
  }
}

module.exports = BasicReadOnlyExplorer
