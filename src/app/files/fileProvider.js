'use strict'

var EventManager = require('../../lib/events')

class FileProvider {
  constructor (name) {
    this.event = new EventManager()
    this.type = name
  }

  exists (path, cb) {
    cb(null, this._exists(path))
  }

  _exists (path) {
    var unprefixedpath = this.removePrefix(path)
    return window.remixFileSystem.existsSync(unprefixedpath)
  }

  init (cb) {
    cb()
  }

  get (path, cb) {
    cb = cb || function () {}
    var unprefixedpath = this.removePrefix(path)
    var exists = window.remixFileSystem.existsSync(unprefixedpath)
    if (!exists) return cb(null, null)
    window.remixFileSystem.readFile(unprefixedpath, 'utf8', (err, content) => {
      cb(err, content)
    })
  }

  set (path, content, cb) {
    cb = cb || function () {}
    var unprefixedpath = this.removePrefix(path)
    var exists = window.remixFileSystem.existsSync(unprefixedpath)
    if (!exists && unprefixedpath.indexOf('/') !== -1) {
      const paths = unprefixedpath.split('/')
      paths.pop() // last element should the filename
      if (paths.length && paths[0] === '') paths.shift()
      let currentCheck = ''
      paths.forEach((value) => {
        currentCheck = currentCheck + '/' + value
        if (!window.remixFileSystem.existsSync(currentCheck)) {
          window.remixFileSystem.mkdirSync(currentCheck)
          this.event.trigger('folderAdded', [this._normalizePath(currentCheck)])
        }
      })
    }
    try {
      window.remixFileSystem.writeFileSync(unprefixedpath, content)
    } catch (e) {
      cb(e)
      return false
    }
    if (!exists) {
      this.event.trigger('fileAdded', [this._normalizePath(unprefixedpath), false])
    } else {
      this.event.trigger('fileChanged', [this._normalizePath(unprefixedpath)])
    }
    cb()
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
    if (!this._exists(unprefixedpath)) {
      return false
    }
    const stat = window.remixFileSystem.statSync(unprefixedpath)
    try {
      if (stat.isDirectory()) {
        window.remixFileSystem.rmdirSync(unprefixedpath, console.log)
      } else {
        window.remixFileSystem.unlinkSync(unprefixedpath, console.log)
      }
      this.event.trigger('fileRemoved', [this._normalizePath(unprefixedpath)])
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  rename (oldPath, newPath, isFolder) {
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    if (this._exists(unprefixedoldPath)) {
      window.remixFileSystem.renameSync(unprefixedoldPath, unprefixednewPath)
      this.event.trigger('fileRenamed', [
        this._normalizePath(unprefixedoldPath),
        this._normalizePath(unprefixednewPath),
        isFolder
      ])
      return true
    }
    return false
  }

  resolveDirectory (path, callback) {
    if (!path) return callback(null, { [this.type]: {} })
    path = this.removePrefix(path)
    if (path.indexOf('/') !== 0) path = '/' + path

    window.remixFileSystem.readdir(path, (error, files) => {
      var ret = {}
      if (files) {
        files.forEach(element => {
          const absPath = (path === '/' ? '' : path) + '/' + element
          ret[absPath.indexOf('/') === 0 ? absPath.replace('/', '') : absPath] = { isDirectory: window.remixFileSystem.statSync(absPath).isDirectory() }
          // ^ ret does not accept path starting with '/'
        })
      }
      callback(error, ret)
    })
  }

  removePrefix (path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, '') : path
    return path
  }

  _normalizePath (path) {
    if (path.indexOf('/') !== 0) path = '/' + path
    return this.type + path
  }
}

module.exports = FileProvider
