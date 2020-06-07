'use strict'
var EventManager = require('../../lib/events')
var pathtool = require('path')

module.exports = class RemixDProvider {
  constructor (appManager) {
    this._appManager = appManager
    this.remixd = remixapi(appManager, this)
    this.event = new EventManager()
    this.type = 'localhost'
    this.error = { 'EEXIST': 'File already exists' }
    this._isReady = false
    this._readOnlyFiles = {}
    this._readOnlyMode = false
    this.filesContent = {}
    this.files = {}

    var remixdEvents = ['connecting', 'connected', 'errored', 'closed']
    remixdEvents.forEach((value) => {
      // remixd.event.register(value, (event) => {
      //   this.event.trigger(value, [event])
      // })
    })

    // remixd.event.register('notified', (data) => {
    //   if (data.scope === 'sharedfolder') {
    //     if (data.name === 'created') {
    //       this.init(() => {
    //         this.event.trigger('fileAdded', [this.type + '/' + data.value.path, data.value.isReadOnly, data.value.isFolder])
    //       })
    //     } else if (data.name === 'removed') {
    //       this.init(() => {
    //         this.event.trigger('fileRemoved', [this.type + '/' + data.value.path])
    //       })
    //     } else if (data.name === 'changed') {
    //       this._appManager.call('sharedfolder', 'get', {path: data.value}, (error, content) => {
    //         if (error) {
    //           console.log(error)
    //         } else {
    //           var path = this.type + '/' + data.value
    //           this.filesContent[path] = content
    //           this.event.trigger('fileExternallyChanged', [path, content])
    //         }
    //       })
    //     } else if (data.name === 'rootFolderChanged') {
    //       // new path has been set, we should reset
    //       this.event.trigger('folderAdded', [this.type + '/'])
    //     }
    //   }
    // })
  }

  isConnected () {
    return this._isReady
  }

  close (cb) {
    this.remixd.exit()
    this._isReady = false
    cb()
  }

  async init (cb) {
      const result = await this._appManager.call('remixdWebsocketPlugin', 'folderIsReadOnly', {})
      this._readOnlyMode = result
  }

  // @TODO: refactor all `this._appManager.call(....)` uses into `this.remixd[api](...)`
  // where `api = ...`:
  // this.remixd.read(path, (error, content) => {})
  // this.remixd.write(path, content, (error, result) => {})
  // this.remixd.rename(path1, path2, (error, result) => {})
  // this.remixd.remove(path, (error, result) => {})
  // this.remixd.dir(path, (error, filesList) => {})
  //
  // this.remixd.exists(path, (error, isValid) => {})

  async exists (path, cb) {
    const unprefixedpath = this.removePrefix(path)
    const callId = await this._appManager.call('sharedfolder', 'exists', {path: unprefixedpath})
    const result = await this._appManager.receiveResponse(callId)

    return cb(null, result)
  }

  getNormalizedName (path) {
    return path
  }

  getPathFromUrl (path) {
    return path
  }

  get (path, cb) {
    var unprefixedpath = this.removePrefix(path)
    this._appManager.call('sharedfolder', 'get', {path: unprefixedpath}, (error, file) => {
      if (!error) {
        this.filesContent[path] = file.content
        if (file.readonly) { this._readOnlyFiles[path] = 1 }
        cb(error, file.content)
      } else {
        // display the last known content.
        // TODO should perhaps better warn the user that the file is not synced.
        cb(null, this.filesContent[path])
      }
    })
  }

  set (path, content, cb) {
    var unprefixedpath = this.removePrefix(path)
    this._appManager.call('sharedfolder', 'set', {path: unprefixedpath, content: content}, (error, result) => {
      if (cb) return cb(error, result)
      var path = this.type + '/' + unprefixedpath
      this.event.trigger('fileChanged', [path])
    })
    return true
  }

  isReadOnly (path) {
    return this._readOnlyMode || this._readOnlyFiles[path] === 1
  }

  async remove (path) {
    var unprefixedpath = this.removePrefix(path)
    const callId = await this._appManager.call('sharedfolder', 'remove', {path: unprefixedpath}, (error, result) => {
      if (error) console.log(error)
      var path = this.type + '/' + unprefixedpath
      delete this.filesContent[path]
      this.init(() => {
        this.event.trigger('fileRemoved', [path])
      })
    })

    return await this._appManager.receiveResponse(callId)
  }

  rename (oldPath, newPath, isFolder) {
    var unprefixedoldPath = this.removePrefix(oldPath)
    var unprefixednewPath = this.removePrefix(newPath)
    this._appManager.call('sharedfolder', 'rename', {oldPath: unprefixedoldPath, newPath: unprefixednewPath}, (error, result) => {
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

  isExternalFolder (path) {
    return false
  }

  removePrefix (path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, '') : path
    if (path[0] === '/') return path.substring(1)
    return path
  }

  resolveDirectory (path, callback) {
    var self = this
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [self.type]: { } })
    path = self.removePrefix(path)
    self.remixd.dir(path, callback)
  }

  async isDirectory (path) {
    const unprefixedpath = this.removePrefix(path)
    const callId = await this._appManager.call('sharedfolder', 'isDirectory', {path: unprefixedpath})

    return await this._appManager.receiveResponse(callId)
  }

  async isFile (path) {
    const unprefixedpath = this.removePrefix(path)
    const callId = await this._appManager.call('sharedfolder', 'isFile', {path: unprefixedpath})

    return await this._appManager.receiveResponse(callId)
  }
}

function remixapi (appManager, self) {
  const read = (path, callback) => {
    path = '' + (path || '')
    path = pathtool.join('./', path)
    appManager.call('sharedfolder', 'get', { path }, (error, content) => callback(error, content))
  }
  const write = (path, content, callback) => {
    path = '' + (path || '')
    path = pathtool.join('./', path)
    appManager.call('sharedfolder', 'set', { path, content }, (error, result) => callback(error, result))
  }
  const rename = (path, newpath, callback) => {
    path = '' + (path || '')
    path = pathtool.join('./', path)
    appManager.call('sharedfolder', 'rename', { oldPath: path, newPath: newpath }, (error, result) => callback(error, result))
  }
  const remove = (path, callback) => {
    path = '' + (path || '')
    path = pathtool.join('./', path)
    appManager.call('sharedfolder', 'remove', { path }, (error, result) => callback(error, result))
  }
  const dir = (path, callback) => {
    path = '' + (path || '')
    path = pathtool.join('./', path)
    appManager.call('sharedfolder', 'resolveDirectory', { path }, (error, filesList) => callback(error, filesList))
  }
  const exit = () => { remixd.close() }
  // const api = { read, write, rename, remove, dir, exit, event: remixd.event }
  const api = { read, write, rename, remove, dir, exit, event: self.event }
  return api
}
