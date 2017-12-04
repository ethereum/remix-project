'use strict'
var EventManager = require('remix-lib').EventManager

class SwarmExplorer {
  constructor (type) {
    this.event = new EventManager()
    this.files = {}
    this.type = type
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
    if (cb) {
      cb(null, content)
    }
    return content
  }

  set (path, content, cb) {
    return true
  }

  addReadOnly (path, content) {
    this.files[this.type + '/' + path] = content
    this.event.trigger('fileAdded', [this.type + '/' + path, true])
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

  //
  // Tree model for files
  // {
  //   'a': { }, // empty directory 'a'
  //   'b': {
  //     'c': {}, // empty directory 'b/c'
  //     'd': { '/readonly': true, '/content': 'Hello World' } // files 'b/c/d'
  //     'e': { '/readonly': false, '/path': 'b/c/d' } // symlink to 'b/c/d'
  //     'f': { '/readonly': false, '/content': '<executable>', '/mode': 0755 }
  //   }
  // }
  //
  listAsTree () {
    function hashmapize (obj, path, val) {
      var nodes = path.split('/')
      var i = 0

      for (; i < nodes.length - 1; i++) {
        var node = nodes[i]
        if (obj[node] === undefined) {
          obj[node] = {}
        }
        obj = obj[node]
      }

      obj[nodes[i]] = val
    }

    var tree = {}

    var self = this
    // This does not include '.remix.config', because it is filtered
    // inside list().
    Object.keys(this.list()).forEach(function (path) {
      hashmapize(tree, path, {
        '/readonly': self.isReadOnly(path),
        '/content': self.get(path)
      })
    })
    return tree
  }
}

module.exports = SwarmExplorer
