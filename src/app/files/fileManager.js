'use strict'

import yo from 'yo-yo'
import async from 'async'
const EventEmitter = require('events')
const globalRegistry = require('../../global/registry')
const CompilerImport = require('../compiler/compiler-imports')
const toaster = require('../ui/tooltip')
const modalDialogCustom = require('../ui/modal-dialog-custom')
const helper = require('../../lib/helper.js')
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

/*
  attach to files event (removed renamed)
  trigger: currentFileChanged
*/

const profile = {
  name: 'fileManager',
  displayName: 'File manager',
  description: 'Service - read/write to any files or folders, require giving permissions',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDM4NHE0MCAwIDY4IDI4dDI4IDY4djEyMTZxMCA0MC0yOCA2OHQtNjggMjhoLTk2MHEtNDAgMC02OC0yOHQtMjgtNjh2LTI4OGgtNTQ0cS00MCAwLTY4LTI4dC0yOC02OHYtNjcycTAtNDAgMjAtODh0NDgtNzZsNDA4LTQwOHEyOC0yOCA3Ni00OHQ4OC0yMGg0MTZxNDAgMCA2OCAyOHQyOCA2OHYzMjhxNjgtNDAgMTI4LTQwaDQxNnptLTU0NCAyMTNsLTI5OSAyOTloMjk5di0yOTl6bS02NDAtMzg0bC0yOTkgMjk5aDI5OXYtMjk5em0xOTYgNjQ3bDMxNi0zMTZ2LTQxNmgtMzg0djQxNnEwIDQwLTI4IDY4dC02OCAyOGgtNDE2djY0MGg1MTJ2LTI1NnEwLTQwIDIwLTg4dDQ4LTc2em05NTYgODA0di0xMTUyaC0zODR2NDE2cTAgNDAtMjggNjh0LTY4IDI4aC00MTZ2NjQwaDg5NnoiLz48L3N2Zz4=',
  permission: true,
  version: packageJson.version,
  methods: ['getFolder', 'getCurrentFile', 'getFile', 'setFile', 'switchFile'],
  kind: 'file-system'
}

// File System profile
// - methods: ['getFolder', 'getCurrentFile', 'getFile', 'setFile', 'switchFile']

class FileManager extends Plugin {
  constructor (editor) {
    super(profile)
    this.openedFiles = {} // list all opened files
    this.events = new EventEmitter()
    this.editor = editor
    this._components = {}
    this._components.compilerImport = new CompilerImport()
    this._components.registry = globalRegistry
    this.init()
  }

  init () {
    this._deps = {
      config: this._components.registry.get('config').api,
      browserExplorer: this._components.registry.get('fileproviders/browser').api,
      localhostExplorer: this._components.registry.get('fileproviders/localhost').api,
      filesProviders: this._components.registry.get('fileproviders').api
    }
    this._deps.browserExplorer.event.register('fileChanged', (path) => { this.fileChangedEvent(path) })
    this._deps.browserExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.localhostExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.browserExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.register('errored', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
    this._deps.localhostExplorer.event.register('closed', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
  }

  fileChangedEvent (path) {
    // @todo(#2386) use only for discard changes function.
    // this.syncEditor(path)
  }

  fileRenamedEvent (oldName, newName, isFolder) {
    if (!isFolder) {
      this._deps.config.set('currentFile', '')
      this.editor.discard(oldName)
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
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('fileRenamed', oldName, newName, isFolder)
    this.events.emit('fileRenamed', oldName, newName, isFolder)
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
    if (!Object.keys(this.openedFiles).length) {
      this._deps.config.set('currentFile', '')
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('noFileSelected')
      this.events.emit('noFileSelected')
    }
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('fileClosed', name)
    this.events.emit('fileClosed', name)
  }

  currentPath () {
    var currentFile = this._deps.config.get('currentFile')
    return this.extractPathOf(currentFile)
  }

  extractPathOf (file) {
    var reg = /(.*)(\/).*/
    var path = reg.exec(file)
    return path ? path[1] : null
  }

  getCurrentFile () {
    const path = this.currentFile()
    if (!path) throw new Error('No file selected')
    return path
  }

  getFile (path) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw new Error(`${path} not available`)
    // TODO: change provider to Promise
    return new Promise((resolve, reject) => {
      if (this.currentFile() === path) return resolve(this.editor.currentContent())
      provider.get(path, (err, content) => {
        if (err) reject(err)
        resolve(content)
      })
    })
  }

  async setFile (path, content) {
    if (this.currentRequest) {
      const canCall = await this.askUserPermission('setFile', '')
      if (canCall) {
        this._setFileInternal(path, content)
        // inform the user about modification after permission is granted and even if permission was saved before
        toaster(yo`
          <div>
            <i class="fas fa-exclamation-triangle text-danger mr-1"></i>
            <span>
              ${this.currentRequest.from}
              <span class="font-weight-bold text-warning">
                is modifying 
              </span>${path}
            </span>
          </div>
        `, '', { time: 3000 })
      }
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

  _saveAsCopy (path, content) {
    const fileProvider = this.fileProviderOf(path)
    if (fileProvider) {
      helper.createNonClashingNameWithPrefix(path, fileProvider, '', (error, copyName) => {
        if (error) {
          console.log('createNonClashingNameWithPrefix', error)
          copyName = path + '.' + this.currentRequest.from
        }
        this._setFileInternal(copyName, content)
        this.switchFile(copyName)
      })
    }
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
    this.editor.discard(path)
    delete this.openedFiles[path]
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('fileRemoved', path)
    this.events.emit('fileRemoved', path)
    this.switchFile()
  }

  unselectCurrentFile () {
    this.saveCurrentFile()
    this._deps.config.set('currentFile', '')
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('noFileSelected')
    this.events.emit('noFileSelected')
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
            this.editor.openReadOnly(file, content)
          } else {
            this.editor.open(file, content)
          }
          // TODO: Only keep `this.emit` (issue#2210)
          this.emit('currentFileChanged', file)
          this.events.emit('currentFileChanged', file)
        }
      })
    }
    if (file) return _switchFile(file)
    else {
      var browserProvider = this._deps.filesProviders['browser']
      browserProvider.resolveDirectory('browser', (error, filesProvider) => {
        if (error) console.error(error)
        var fileList = Object.keys(filesProvider)
        if (fileList.length) {
          _switchFile(browserProvider.type + '/' + fileList[0])
        } else {
          // TODO: Only keep `this.emit` (issue#2210)
          this.emit('noFileSelected')
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
      provider.resolveDirectory(path, (error, filesProvider) => {
        if (error) reject(error)
        resolve(filesProvider)
      })
    })
  }

  getProvider (name) {
    return this._deps.filesProviders[name]
  }

  fileProviderOf (file) {
    if (file.indexOf('localhost') === 0) {
      return this._deps.filesProviders['localhost']
    }
    return this._deps.filesProviders['browser']
  }

  saveCurrentFile () {
    var currentFile = this._deps.config.get('currentFile')
    if (currentFile && this.editor.current()) {
      var input = this.editor.get(currentFile)
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
        this.editor.setText(content)
      })
    } else {
      console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
    }
  }

  setBatchFiles (filesSet, fileProvider, override, callback) {
    const self = this
    if (!fileProvider) fileProvider = 'browser'
    if (override === undefined) override = false

    async.each(Object.keys(filesSet), (file, callback) => {
      if (override) {
        self._deps.filesProviders[fileProvider].set(file, filesSet[file].content)
        self.syncEditor(fileProvider + file)
        return callback()
      }

      helper.createNonClashingName(file, self._deps.filesProviders[fileProvider],
      (error, name) => {
        if (error) {
          modalDialogCustom.alert('Unexpected error loading the file ' + error)
        } else if (helper.checkSpecialChars(name)) {
          modalDialogCustom.alert('Special characters are not allowed')
        } else {
          self._deps.filesProviders[fileProvider].set(name, filesSet[file].content)
          self.syncEditor(fileProvider + name)
        }
        callback()
      })
    }, (error) => {
      if (callback) callback(error)
    })
  }
}

module.exports = FileManager
