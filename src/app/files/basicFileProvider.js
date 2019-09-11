'use strict'
const EventManager = require('../../lib/events')
const toolTip = require('../ui/tooltip')

class BasicFileProvider {
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

  exists (path, cb) {
    if (!this.files) return cb(null, false)
    var unprefixedPath = this.removePrefix(path)
    cb(null, this.files[unprefixedPath] !== undefined)
  }

  get (path, cb) {
    if (this.normalizedNames[path]) path = this.normalizedNames[path] // ensure we actually use the normalized path from here
    var unprefixedPath = this.removePrefix(path)
    var content = this.files[unprefixedPath]
    if (!content) {
      content = this.files[this.type + '/' + this.normalizedNames[path]]
    }
    if (cb) {
      cb(null, content)
    }
    return content
  }

  set (path, content, cb) {
    this.addReadOnly(path, content)
    if (cb) cb()
    return true
  }

  addReadOnly (path, content, rawPath) {
    path = this.removePrefix(path)
    try { // lazy try to format JSON
      content = JSON.stringify(JSON.parse(content), null, '\t')
    } catch (e) {}
    if (!rawPath) rawPath = path
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
    this.event.trigger('fileAdded', [this.type + '/' + path, true])
    return true
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

module.exports = BasicFileProvider
