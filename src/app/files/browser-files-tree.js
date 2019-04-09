'use strict'

var EventManager = require('../../lib/events')

import { BaseApi } from 'remix-plugin'

class FilesTree extends BaseApi {
  constructor (name, storage) {
    super({
      name: name,
      methods: ['get', 'set', 'remove'],
      description:
        'service - read/write file to the `config` explorer without need of additionnal permission.'
    })
    this.event = new EventManager()
    this.storage = storage
    this.type = name
    this.structFile = '.' + name + '.tree'
    this.tree = {}
  }

  exists (path, cb) {
    cb(null, this._exists(path))
  }

  updateRefs (path, type) {
    var split = path.split('/') // this should be unprefixed path
    var crawlpath = this.tree
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
    this.storage.set(this.structFile, JSON.stringify(this.tree))
  }

  _exists (path) {
    var unprefixedpath = this.removePrefix(path)
    return this.storage.exists(unprefixedpath)
  }

  init (cb) {
    var tree = this.storage.get(this.structFile)
    this.tree = tree ? JSON.parse(tree) : {}
    if (cb) cb()
  }

  get (path, cb) {
    var unprefixedpath = this.removePrefix(path)
    var content = this.storage.get(unprefixedpath)
    if (cb) {
      cb(null, content)
    }
    return content
  }

  set (path, content, cb) {
    var unprefixedpath = this.removePrefix(path)
    this.updateRefs(unprefixedpath, 'add')
    var exists = this.storage.exists(unprefixedpath)
    if (!this.storage.set(unprefixedpath, content)) {
      if (cb) cb('error updating ' + path)
      return false
    }
    if (!exists) {
      this.event.trigger('fileAdded', [this.type + '/' + unprefixedpath, false])
    } else {
      this.event.trigger('fileChanged', [this.type + '/' + unprefixedpath])
    }
    if (cb) cb()
    return true
  }

  addReadOnly (path, content) {
    return this.set(path, content)
  }

  isReadOnly (path) {
    return false
  }

  remove (path) {
    var unprefixedpath = this.removePrefix(path)
    this.updateRefs(unprefixedpath, 'remove')
    if (!this._exists(unprefixedpath)) {
      return false
    }
    if (!this.storage.remove(unprefixedpath)) {
      return false
    }
    this.event.trigger('fileRemoved', [this.type + '/' + unprefixedpath])
    return true
  }

  rename (oldPath, newPath, isFolder) {
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    this.updateRefs(unprefixedoldPath, 'remove')
    this.updateRefs(unprefixednewPath, 'add')
    if (this.storage.exists(unprefixedoldPath)) {
      if (!this.storage.rename(unprefixedoldPath, unprefixednewPath)) {
        return false
      }
      this.event.trigger('fileRenamed', [
        this.type + '/' + unprefixedoldPath,
        this.type + '/' + unprefixednewPath,
        isFolder
      ])
      return true
    }
    return false
  }

  resolveDirectory (path, callback) {
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [this.type]: {} })
    var tree = {}
    path = this.removePrefix(path)

    var split = path.split('/') // this should be unprefixed path
    var crawlpath = this.tree
    split.forEach((pathPart, index) => {
      if (crawlpath[pathPart]) crawlpath = crawlpath[pathPart]
    })

    for (var item in crawlpath) {
      tree[item] = { isDirectory: typeof crawlpath[item] !== 'string' }
    }
    callback(null, tree)
  }

  removePrefix (path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, '') : path
    if (path[0] === '/') return path.substring(1)
    return path
  }
}

module.exports = FilesTree
