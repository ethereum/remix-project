'use strict'
var EventManager = require('remix-lib').EventManager

class BasicReadOnlyExplorer {
  constructor (type) {
    this.event = new EventManager()
    this.files = {}
    this.normalizedNames = {} // contains the raw url associated with the displayed path
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
    this.addReadOnly(path, content)
    if (cb) cb()
    return true
  }

  addReadOnly (path, content, rawPath) {
    var unprefixedPath = this.removePrefix(path)
    try { // lazy try to format JSON
      content = JSON.stringify(JSON.parse(content), null, '\t')
    } catch (e) {}
    this.files[this.type + '/' + unprefixedPath] = content
    this.normalizedNames[rawPath] = path
    this.event.trigger('fileAdded', [this.type + '/' + unprefixedPath, true])
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
  resolveDirectory (path, callback /* (error, filesList) => { } */) {
    var self = this
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [self.type]: { } })
    var tree = {}
    // This does not include '.remix.config', because it is filtered
    // inside list().
    Object.keys(this.list()).forEach(function (path) {
      hashmapize(tree, path, {
        '/readonly': self.isReadOnly(path),
        '/content': self.get(path)
      })
    })
    return callback(null, tree[path] || {})
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
  }

  removePrefix (path) {
    return path.indexOf(this.type + '/') === 0 ? path.replace(this.type + '/', '') : path
  }
}

module.exports = BasicReadOnlyExplorer
