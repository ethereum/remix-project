'use strict'

var EventEmitter = require('events')
var EventManager = require('../../lib/events')
var globalRegistry = require('../../global/registry')
var CompilerImport = require('../compiler/compiler-imports')

/*
  attach to files event (removed renamed)
  trigger: currentFileChanged
*/

class FileManager {
  constructor (localRegistry) {
    this.openedFiles = {} // list all opened files
    this.event = new EventManager()
    this.nodeEvent = new EventEmitter()
    this._components = {}
    this._components.compilerImport = new CompilerImport()
    this._components.registry = localRegistry || globalRegistry
  }

  init () {
    var self = this
    self._deps = {
      editor: self._components.registry.get('editor').api,
      config: self._components.registry.get('config').api,
      browserExplorer: self._components.registry.get('fileproviders/browser').api,
      localhostExplorer: self._components.registry.get('fileproviders/localhost').api,
      configExplorer: self._components.registry.get('fileproviders/config').api,
      gistExplorer: self._components.registry.get('fileproviders/gist').api,
      filesProviders: self._components.registry.get('fileproviders').api
    }

    self._deps.browserExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.localhostExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.configExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.gistExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.browserExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.localhostExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.configExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.gistExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.localhostExplorer.event.register('errored', (event) => { this.removeTabsOf(self._deps.localhostExplorer) })
    self._deps.localhostExplorer.event.register('closed', (event) => { this.removeTabsOf(self._deps.localhostExplorer) })

    self.event.register('currentFileChanged', (file, provider) => {
      this.nodeEvent.emit('currentFileChanged', file)
    })
  }

  profile () {
    return {
      displayName: 'file manager',
      name: 'fileManager',
      methods: ['getFilesFromPath', 'getCurrentFile', 'getFile', 'setFile'],
      events: ['currentFileChanged'],
      description: 'service - read/write to any files or folders, require giving permissions'
    }
  }

  fileRenamedEvent (oldName, newName, isFolder) {
    var self = this
    if (!isFolder) {
      self._deps.config.set('currentFile', '')
      self._deps.editor.discard(oldName)
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
          if (self._deps.config.get('currentFile') === k) {
            newFocus = newAbsolutePath
          }
        }
      }
      if (newFocus) {
        this.switchFile(newFocus)
      }
    }
    this.event.trigger('fileRenamed', [oldName, newName])
  }

  currentFileProvider () {
    var path = this.currentPath()
    if (path) {
      return this.fileProviderOf(path)
    }
    return null
  }

  currentFile () {
    var self = this
    return self._deps.config.get('currentFile')
  }

  closeFile (name) {
    delete this.openedFiles[name]
    if (Object.keys(this.openedFiles).length) {
      this.switchFile(Object.keys(this.openedFiles)[0])
    } else {
      this._deps.editor.displayEmptyReadOnlySession()
      this._deps.config.set('currentFile', '')
    }
    this.event.trigger('fileClosed', [name])
  }

  currentPath () {
    var self = this
    var currentFile = self._deps.config.get('currentFile')
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
    var self = this
    if (!this.openedFiles[path]) return
    if (path === self._deps.config.get('currentFile')) {
      self._deps.config.set('currentFile', '')
    }
    self._deps.editor.discard(path)
    delete this.openedFiles[path]
    this.event.trigger('fileRemoved', [path])
    this.switchFile()
  }

  switchFile (file) {
    var self = this
    if (file) return _switchFile(file)
    else {
      var browserProvider = self._deps.filesProviders['browser']
      browserProvider.resolveDirectory('browser', (error, filesTree) => {
        if (error) console.error(error)
        var fileList = Object.keys(filesTree)
        if (fileList.length) {
          _switchFile(browserProvider.type + '/' + fileList[0])
        } else {
          self.event.trigger('currentFileChanged', [])
          self._deps.editor.displayEmptyReadOnlySession()
        }
      })
    }
    function _switchFile (file) {
      self.saveCurrentFile()
      self._deps.config.set('currentFile', file)
      self.openedFiles[file] = file
      self.fileProviderOf(file).get(file, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          if (self.fileProviderOf(file).isReadOnly(file)) {
            self._deps.editor.openReadOnly(file, content)
          } else {
            self._deps.editor.open(file, content)
          }
          self.event.trigger('currentFileChanged', [file, self.fileProviderOf(file)])
        }
      })
    }
  }

  getFilesFromPath (path) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw new Error(`provider for path ${path} not found`)
    // TODO : Change provider with promise
    return new Promise((resolve, reject) => {
      provider.resolveDirectory(path, (error, filesTree) => {
        if(error) reject(error)
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
    var self = this
    var currentFile = this._deps.config.get('currentFile')
    if (path !== currentFile) return

    var provider = this.fileProviderOf(currentFile)
    if (provider) {
      provider.get(currentFile, (error, content) => {
        if (error) console.log(error)
        self._deps.editor.setText(content)
      })
    } else {
      console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
    }
  }
}

module.exports = FileManager
