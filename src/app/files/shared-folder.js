'use strict'
var async = require('async')
var EventManager = require('ethereum-remix').lib.EventManager

class SharedFolder {
  constructor (remixd) {
    this.event = new EventManager()
    this.remixd = remixd
    this.files = null
    this.filesContent = {}
    this.filesTree = null
    this.type = 'localhost'
    this.error = {
      'EEXIST': 'File already exists'
    }
    this.remixd.event.register('notified', (data) => {
      if (data.scope === 'sharedfolder') {
        if (data.name === 'created') {
          this.init(() => {
            this.event.trigger('fileAdded', [this.type + '/' + data.value.path, data.value.isReadOnly, data.value.isFolder])
          })
        } else if (data.name === 'removed') {
          this.init(() => {
            this.event.trigger('fileRemoved', [this.type + '/' + data.value.path])
          })
        } else if (data.name === 'changed') {
          this.remixd.call('sharedfolder', 'get', {path: data.value}, (error, content) => {
            if (error) {
              console.log(error)
            } else {
              var path = this.type + '/' + data.value
              this.filesContent[path] = content
              this.event.trigger('fileExternallyChanged', [path, content])
            }
          })
        }
      }
    })
  }

  close (cb) {
    this.remixd.close()
    this.files = null
    this.filesTree = null
    cb()
  }

  init (cb) {
    this.remixd.call('sharedfolder', 'list', {}, (error, filesList) => {
      if (error) {
        cb(error)
      } else {
        this.files = {}
        for (var k in filesList) {
          this.files[this.type + '/' + k] = filesList[k]
        }
        listAsTree(this, this.files, (error, tree) => {
          this.filesTree = tree
          cb(error)
        })
      }
    })
  }

  exists (path) {
    if (!this.files) return false
    return this.files[path] !== undefined
  }

  get (path, cb) {
    var unprefixedpath = this.removePrefix(path)
    this.remixd.call('sharedfolder', 'get', {path: unprefixedpath}, (error, content) => {
      if (!error) {
        this.filesContent[path] = content
        cb(error, content)
      } else {
        // display the last known content.
        // TODO should perhaps better warn the user that the file is not synced.
        cb(null, this.filesContent[path])
      }
    })
  }

  set (path, content, cb) {
    var unprefixedpath = this.removePrefix(path)
    this.remixd.call('sharedfolder', 'set', {path: unprefixedpath, content: content}, (error, result) => {
      if (cb) cb(error, result)
      var path = this.type + '/' + unprefixedpath
      this.filesContent[path]
      this.event.trigger('fileChanged', [path])
    })
    return true
  }

  addReadOnly (path, content) {
    return false
  }

  isReadOnly (path) {
    if (this.files) return this.files[path]
    return true
  }

  remove (path) {
    var unprefixedpath = this.removePrefix(path)
    this.remixd.call('sharedfolder', 'remove', {path: unprefixedpath}, (error, result) => {
      if (error) console.log(error)
      var path = this.type + '/' + unprefixedpath
      delete this.filesContent[path]
      this.init(() => {
        this.event.trigger('fileRemoved', [path])
      })
    })
  }

  rename (oldPath, newPath, isFolder) {
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    this.remixd.call('sharedfolder', 'rename', {oldPath: unprefixedoldPath, newPath: unprefixednewPath}, (error, result) => {
      if (error) {
        console.log(error)
        if (this.error[error.code]) error = this.error[error.code]
        this.event.trigger('fileRenamedError', [this.error[error.code]])
      } else {
        var newPath = this.type + '/' + unprefixednewPath
        var oldPath = this.type + '/' + unprefixedoldPath
        this.filesContent[newPath] = this.filesContent[oldPath]
        delete this.filesContent[oldPath]
        this.init(() => {
          this.event.trigger('fileRenamed', [oldPath, newPath, isFolder])
        })
      }
    })
    return true
  }

  list () {
    return this.files
  }

  listAsTree () {
    return this.filesTree
  }

  removePrefix (path) {
    return path.indexOf(this.type + '/') === 0 ? path.replace(this.type + '/', '') : path
  }
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
function listAsTree (self, filesList, callback) {
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

  // This does not include '.remix.config', because it is filtered
  // inside list().
  async.eachSeries(Object.keys(filesList), function (path, cb) {
    self.get(path, (error, content) => {
      if (error) {
        console.log(error)
        cb(error)
      } else {
        self.filesContent[path] = content
        hashmapize(tree, path, {
          '/readonly': filesList[path],
          '/content': content
        })
        cb()
      }
    })
  }, (error) => {
    callback(error, tree)
  })
}

module.exports = SharedFolder
