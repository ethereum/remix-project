'use strict'

var EventManager = require('remix-lib').EventManager

function FilesTree (name, storage) {
  var self = this
  var event = new EventManager()
  this.event = event
  this.type = name
  this.structFile = '.' + name + '.tree'
  this.tree = {}

  this.exists = function (path, cb) {
    cb(null, this._exists(path))
  }

  function updateRefs (path, type) {
    var split = path.split('/') // this should be unprefixed path
    var crawlpath = self.tree
    var intermediatePath = ''
    split.forEach((pathPart, index) => {
      intermediatePath += pathPart
      if (!crawlpath[pathPart]) crawlpath[intermediatePath] = {}
      if (index < split.length - 1) {
        crawlpath = crawlpath[intermediatePath]
        intermediatePath += '/'
      } else if (type === 'add') {
        crawlpath[intermediatePath] = path
      } else if (type === 'remove' && crawlpath[intermediatePath]) {
        delete crawlpath[intermediatePath]
      }
    })
    storage.set(self.structFile, JSON.stringify(self.tree))
  }

  this._exists = function (path) {
    var unprefixedpath = this.removePrefix(path)
    return storage.exists(unprefixedpath)
  }

  this.init = function (cb) {
    var tree = storage.get(this.structFile)
    this.tree = tree ? JSON.parse(tree) : {}
    if (cb) cb()
  }

  this.get = function (path, cb) {
    var unprefixedpath = this.removePrefix(path)
    var content = storage.get(unprefixedpath)
    if (cb) {
      cb(null, content)
    }
    return content
  }

  this.set = function (path, content) {
    var unprefixedpath = this.removePrefix(path)
    updateRefs(unprefixedpath, 'add')
    var exists = storage.exists(unprefixedpath)
    if (!storage.set(unprefixedpath, content)) {
      return false
    }
    if (!exists) {
      event.trigger('fileAdded', [this.type + '/' + unprefixedpath, false])
    } else {
      event.trigger('fileChanged', [this.type + '/' + unprefixedpath])
    }
    return true
  }

  this.addReadOnly = function (path, content) {
    return this.set(path, content)
  }

  this.isReadOnly = function (path) {
    return false
  }

  this.remove = function (path) {
    var unprefixedpath = this.removePrefix(path)
    updateRefs(unprefixedpath, 'remove')
    if (!this._exists(unprefixedpath)) {
      return false
    }
    if (!storage.remove(unprefixedpath)) {
      return false
    }
    event.trigger('fileRemoved', [this.type + '/' + unprefixedpath])
    return true
  }

  this.rename = function (oldPath, newPath, isFolder) {
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    updateRefs(unprefixedoldPath, 'remove')
    updateRefs(unprefixednewPath, 'add')
    if (storage.exists(unprefixedoldPath)) {
      if (!storage.rename(unprefixedoldPath, unprefixednewPath)) {
        return false
      }
      event.trigger('fileRenamed', [this.type + '/' + unprefixedoldPath, this.type + '/' + unprefixednewPath, isFolder])
      return true
    }
    return false
  }

  this.resolveDirectory = function (path, callback) {
    var self = this
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [self.type]: { } })
    var tree = {}
    path = self.removePrefix(path)

    var split = path.split('/') // this should be unprefixed path
    var crawlpath = self.tree
    split.forEach((pathPart, index) => {
      if (crawlpath[pathPart]) crawlpath = crawlpath[pathPart]
    })

    for (var item in crawlpath) {
      tree[item] = { isDirectory: typeof crawlpath[item] !== 'string' }
    }
    callback(null, tree)
  }

  this.removePrefix = function (path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, '') : path
    if (path[0] === '/') return path.substring(1)
    return path
  }
}

module.exports = FilesTree
