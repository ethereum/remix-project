'use strict'

import yo from 'yo-yo'
const EventEmitter = require('events')
var globalRegistry = require('../../global/registry')
var CompilerImport = require('../compiler/compiler-imports')
var toaster = require('../ui/tooltip')
import { FileSystemApi } from 'remix-plugin'

/*
  attach to files event (removed renamed)
  trigger: currentFileChanged
*/

const profile = {
  name: 'fileManager',
  displayName: 'File manager',
  description: 'Service - read/write to any files or folders, require giving permissions',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDM4NHE0MCAwIDY4IDI4dDI4IDY4djEyMTZxMCA0MC0yOCA2OHQtNjggMjhoLTk2MHEtNDAgMC02OC0yOHQtMjgtNjh2LTI4OGgtNTQ0cS00MCAwLTY4LTI4dC0yOC02OHYtNjcycTAtNDAgMjAtODh0NDgtNzZsNDA4LTQwOHEyOC0yOCA3Ni00OHQ4OC0yMGg0MTZxNDAgMCA2OCAyOHQyOCA2OHYzMjhxNjgtNDAgMTI4LTQwaDQxNnptLTU0NCAyMTNsLTI5OSAyOTloMjk5di0yOTl6bS02NDAtMzg0bC0yOTkgMjk5aDI5OXYtMjk5em0xOTYgNjQ3bDMxNi0zMTZ2LTQxNmgtMzg0djQxNnEwIDQwLTI4IDY4dC02OCAyOGgtNDE2djY0MGg1MTJ2LTI1NnEwLTQwIDIwLTg4dDQ4LTc2em05NTYgODA0di0xMTUyaC0zODR2NDE2cTAgNDAtMjggNjh0LTY4IDI4aC00MTZ2NjQwaDg5NnoiLz48L3N2Zz4=',
  permission: true
}

// File System profile
// - events: ['currentFileChanged']
// - methods: ['getFolder', 'getCurrentFile', 'getFile', 'setFile']

class FileManager extends FileSystemApi {
  constructor (localRegistry) {
    super(profile)
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
      gistExplorer: this._components.registry.get('fileproviders/gist').api,
      filesProviders: this._components.registry.get('fileproviders').api
    }

    this._deps.browserExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.localhostExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.gistExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.browserExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.gistExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('errored', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
    this._deps.localhostExplorer.event.register('closed', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
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
      this.events.emit('noFileSelected')
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

  async setFile (path, content) {
    if (this.currentRequest) {
      let reject = false
      let savedAsAnotherFile = false
      let warnToaster
      const actions = yo`<div class="container ml-1">
        <button class="btn btn-primary btn-sm m-1" onclick=${(e) => { reject = true; e.target.innerHTML = 'Canceled'; warnToaster.hide() }}>Cancel</button>
        <button class="btn btn-primary btn-sm m-1" onclick=${(e) => {
          if (savedAsAnotherFile) return
          savedAsAnotherFile = true
          const newPath = path + '.' + this.currentRequest.from
          this._setFileInternal(newPath, content)
          this.switchFile(newPath)
          e.target.innerHTML = 'Saved'
          warnToaster.hide()
        }}>Save As Copy</button>
        </div>`
      warnToaster = await toaster(yo`<div><span class="text-primary">${this.currentRequest.from}</span> is modyfing <span class="text-primary">${path}</span></div>`, actions, { time: 6000 })
      if (reject) throw new Error(`set file operation on ${path} aborted by user.`)
      if (savedAsAnotherFile) return
    }
    this._setFileInternal(path, content)
  }

  _setFileInternal (path, content) {
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
          this._deps.editor.displayEmptyReadOnlySession()
          this.events.emit('noFileSelected')
        }
      })
    }
  }

  getFolder (path) {
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
