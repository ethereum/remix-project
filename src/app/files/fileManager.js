'use strict'

const EventEmitter = require('events')
var globalRegistry = require('../../global/registry')
var CompilerImport = require('../compiler/compiler-imports')
import { ApiFactory } from 'remix-plugin'

/*
  attach to files event (removed renamed)
  trigger: currentFileChanged
*/

class FileManager extends ApiFactory {
  constructor (localRegistry) {
    super()
    this.openedFiles = {} // list all opened files
    this.events = new EventEmitter()
    this._components = {}
    this._components.compilerImport = new CompilerImport()
    this._components.registry = localRegistry || globalRegistry
  }

  init () {
    this._deps = {
      editor: this._components.registry.get('editor').api,
      config: this._components.registry.get('config').api,
      browserExplorer: this._components.registry.get('fileproviders/browser').api,
      localhostExplorer: this._components.registry.get('fileproviders/localhost').api,
      configExplorer: this._components.registry.get('fileproviders/config').api,
      gistExplorer: this._components.registry.get('fileproviders/gist').api,
      filesProviders: this._components.registry.get('fileproviders').api
    }

    this._deps.browserExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.localhostExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.configExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.gistExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.browserExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.configExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.gistExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('errored', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
    this._deps.localhostExplorer.event.register('closed', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
  }

  get profile () {
    return {
      displayName: 'file manager',
      name: 'fileManager',
      methods: ['getFilesFromPath', 'getCurrentFile', 'getFile', 'setFile'],
      events: ['currentFileChanged'],
      description: 'service - read/write to any files or folders, require giving permissions',
      permission: true
    }
  }

  fileRenamedEvent (oldName, newName, isFolder) {
    if (!isFolder) {
      this._deps.config.set('currentFile', '')
      this._deps.editor.discard(oldName)
      if (this.openedFiles[oldName]) {
        delete this.openedFiles[oldName]
        this.openedFiles[newName] = newName
      }
      this.switchFile(newName)
    } else {
      var newFocus
      for (var k in this.openedFiles) {
        if (k.indexOf(oldName + '/') === 0) {
          var newAbsolutePath = k.replace(oldName, newName)
          this.openedFiles[newAbsolutePath] = newAbsolutePath
          delete this.openedFiles[k]
          if (this._deps.config.get('currentFile') === k) {
            newFocus = newAbsolutePath
          }
        }
      }
      if (newFocus) {
        this.switchFile(newFocus)
      }
    }
    this.events.emit('fileRenamed', oldName, newName)
  }

  currentFileProvider () {
    var path = this.currentPath()
    if (path) {
      return this.fileProviderOf(path)
    }
    return null
  }

  currentFile () {
    return this._deps.config.get('currentFile')
  }

  closeFile (name) {
    delete this.openedFiles[name]
    if (Object.keys(this.openedFiles).length) {
      this.switchFile(Object.keys(this.openedFiles)[0])
    } else {
      this._deps.editor.displayEmptyReadOnlySession()
      this._deps.config.set('currentFile', '')
    }
    this.events.emit('fileClosed', name)
  }

  currentPath () {
    var currentFile = this._deps.config.get('currentFile')
    var reg = /(.*)(\/).*/
    var path = reg.exec(currentFile)
    return path ? path[1] : null
  }

  async getCurrentFile () {
    const path = this.currentFile()
    if (!path) throw new Error('no file selected')
    console.log('Get current File', path)
    return path
  }

  getFile (path) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw new Error(`${path} not available`)
    // TODO: change provider to Promise
    return new Promise((resolve, reject) => {
      provider.get(path, (err, content) => {
        if (err) reject(err)
        resolve(content)
      })
    })
  }

  setFile (path, content) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw new Error(`${path} not availble`)
    // TODO : Add permission
    // TODO : Change Provider to Promise
    return new Promise((resolve, reject) => {
      provider.set(path, content, (error) => {
        if (error) reject(error)
        this.syncEditor(path)
        resolve(true)
      })
    })
  }

  removeTabsOf (provider) {
    for (var tab in this.openedFiles) {
      if (this.fileProviderOf(tab).type === provider.type) {
        this.fileRemovedEvent(tab)
      }
    }
  }

  fileRemovedEvent (path) {
    if (!this.openedFiles[path]) return
    if (path === this._deps.config.get('currentFile')) {
      this._deps.config.set('currentFile', '')
    }
    this._deps.editor.discard(path)
    delete this.openedFiles[path]
    this.events.emit('fileRemoved', path)
    this.switchFile()
  }

  switchFile (file) {
    const _switchFile = (file) => {
      this.saveCurrentFile()
      this._deps.config.set('currentFile', file)
      this.openedFiles[file] = file
      this.fileProviderOf(file).get(file, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          if (this.fileProviderOf(file).isReadOnly(file)) {
            this._deps.editor.openReadOnly(file, content)
          } else {
            this._deps.editor.open(file, content)
          }
          this.events.emit('currentFileChanged', file)
        }
      })
    }
    if (file) return _switchFile(file)
    else {
      var browserProvider = this._deps.filesProviders['browser']
      browserProvider.resolveDirectory('browser', (error, filesTree) => {
        if (error) console.error(error)
        var fileList = Object.keys(filesTree)
        if (fileList.length) {
          _switchFile(browserProvider.type + '/' + fileList[0])
        } else {
          this.events.emit('currentFileChanged')
          this._deps.editor.displayEmptyReadOnlySession()
        }
      })
    }
  }

  getFilesFromPath (path) {
    // TODO : Change provider with promise
    return new Promise((resolve, reject) => {
      const provider = this.fileProviderOf(path)
      if (!provider) return reject(`provider for path ${path} not found`)
      provider.resolveDirectory(path, (error, filesTree) => {
        if (error) reject(error)
        resolve(filesTree)
      })
    })
  }

  fileProviderOf (file) {
    if (!file) return null
    var provider = file.match(/[^/]*/)
    if (provider !== null && this._deps.filesProviders[provider[0]]) {
      return this._deps.filesProviders[provider[0]]
    } else {
      for (var handler of this._components.compilerImport.handlers()) {
        if (handler.match.exec(file)) {
          return this._deps.filesProviders[handler.type]
        }
      }
    }
    return null
  }

  saveCurrentFile () {
    var currentFile = this._deps.config.get('currentFile')
    if (currentFile && this._deps.editor.current()) {
      var input = this._deps.editor.get(currentFile)
      if (input) {
        var provider = this.fileProviderOf(currentFile)
        if (provider) {
          provider.set(currentFile, input)
        } else {
          console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
        }
      }
    }
  }

  syncEditor (path) {
    var currentFile = this._deps.config.get('currentFile')
    if (path !== currentFile) return

    var provider = this.fileProviderOf(currentFile)
    if (provider) {
      provider.get(currentFile, (error, content) => {
        if (error) console.log(error)
        this._deps.editor.setText(content)
      })
    } else {
      console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
    }
  }
}

module.exports = FileManager
