'use strict'

const CompilerImport = require('../compiler/compiler-imports')
const EventManager = require('../../lib/events')
const modalDialogCustom = require('../ui/modal-dialog-custom')
const tooltip = require('../ui/tooltip')
const remixLib = require('remix-lib')
const Storage = remixLib.Storage

class FileProvider {
  constructor (name) {
    this.event = new EventManager()
    this.type = name
    this.providerExternalsStorage = new Storage('providerExternals:')
    this.externalFolders = [this.type + '/swarm', this.type + '/ipfs', this.type + '/github', this.type + '/gists', this.type + '/https']
  }

  addNormalizedName (path, url) {
    this.providerExternalsStorage.set(this.type + '/' + path, url)
    this.providerExternalsStorage.set('reverse-' + url, this.type + '/' + path)
  }

  removeNormalizedName (path) {
    const value = this.providerExternalsStorage.get(path)
    this.providerExternalsStorage.remove(path)
    this.providerExternalsStorage.remove('reverse-' + value)
  }

  normalizedNameExists (path) {
    return this.providerExternalsStorage.exists(path)
  }

  getNormalizedName (path) {
    return this.providerExternalsStorage.get(path)
  }

  getPathFromUrl (url) {
    return this.providerExternalsStorage.get('reverse-' + url)
  }

  isExternalFolder (path) {
    return this.externalFolders.includes(path)
  }

  discardChanges (path) {
    this.remove(path)
    const compilerImport = new CompilerImport()
    this.providerExternalsStorage.keys().map(value => {
      if (value.indexOf(path) === 0) {
        compilerImport.import(
          this.getNormalizedName(value),
          true,
          (loadingMsg) => { tooltip(loadingMsg) },
          (error, content, cleanUrl, type, url) => {
            if (error) {
              modalDialogCustom.alert(error)
            } else {
              this.addExternal(type + '/' + cleanUrl, content, url)
            }
          }
        )
      }
    })
  }

  exists (path, cb) {
    // todo check the type (directory/file) as well #2386
    // currently it is not possible to have a file and folder with same path
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
    path = this.getPathFromUrl(path) || path // ensure we actually use the normalized path from here
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
    if (exists && window.remixFileSystem.readFileSync(unprefixedpath, 'utf8') === content) return true

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

  // this will not add a folder as readonly but keep the original url to be able to restore it later
  addExternal (path, content, url) {
    if (url) this.addNormalizedName(path, url)
    return this.set(path, content)
  }

  isReadOnly (path) {
    return false
  }

  isDirectory (path) {
    return window.remixFileSystem.statSync(path).isDirectory()
  }

  /**
   * Removes the folder recursively
   * @param {*} path is the folder to be removed
   */
  remove (path) {
    path = this.removePrefix(path)
    if (window.remixFileSystem.existsSync(path)) {
      const stat = window.remixFileSystem.statSync(path)
      try {
        if (!stat.isDirectory()) {
          window.remixFileSystem.unlinkSync(path, console.log)
          this.event.trigger('fileRemoved', [this._normalizePath(path)])
          return true
        } else {
          const items = window.remixFileSystem.readdirSync(path)
          if (items.length !== 0) {
            items.forEach((item, index) => {
              const curPath = `${path}/${item}`
              if (window.remixFileSystem.statSync(curPath).isDirectory()) { // delete folder
                this.remove(curPath)
              } else { // delete file
                window.remixFileSystem.unlinkSync(curPath, console.log)
                this.event.trigger('fileRemoved', [this._normalizePath(path)])
              }
            })
            if (window.remixFileSystem.readdirSync(path).length === 0) window.remixFileSystem.rmdirSync(path, console.log)
          } else {
            // folder is empty
            window.remixFileSystem.rmdirSync(path, console.log)
          }
        }
      } catch (e) {
        console.log(e)
        return false
      }
    }
    return true
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
