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
  icon: 'assets/img/fileManager.webp',
  permission: true,
  version: packageJson.version,
  methods: ['file', 'exists', 'open', 'writeFile', 'readFile', 'copyFile', 'rename', 'readdir', 'remove', 'getCurrentFile', 'getFile', 'getFolder', 'setFile', 'switchFile'],
  kind: 'file-system'
}
const errorMsg = {
  ENOENT: 'No such file or directory',
  EISDIR: 'Path is a directory',
  ENOTDIR: 'Path is not on a directory',
  EEXIST: 'File already exists',
  EPERM: 'Permission denied'
}
const createError = (err) => {
  return new Error(`${errorMsg[err.code]} ${err.message || ''}`)
}

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

    /**
   * Emit error if path doesn't exist
   * @param {string} path path of the file/directory
   * @param {string} message message to display if path doesn't exist.
   */
  async _handleExists (path, message) {
    const exists = await this.exists(path)

    if (!exists) {
      throw createError({ code: 'ENOENT', message })
    }
  }

  /**
   * Emit error if path is not a file
   * @param {string} path path of the file/directory
   * @param {string} message message to display if path is not a file.
   */
  async _handleIsFile (path, message) {
    const isFile = await this.isFile(path)

    if (!isFile) {
      throw createError({ code: 'EISDIR', message })
    }
  }

  /**
   * Emit error if path is not a directory
   * @param {string} path path of the file/directory
   * @param {string} message message to display if path is not a directory.
   */
  async _handleIsDir (path, message) {
    const isDir = await this.isDirectory(path)

    if (!isDir) {
      throw createError({ code: 'ENOTDIR', message })
    }
  }

  /** The current opened file */
  file () {
    const file = this.currentFile()

    if (!file) throw createError({ code: 'ENOENT', message: 'No file selected' })
    return file
  }

  /**
   * Verify if the path exists (directory or file)
   * @param {string} path path of the directory or file
   * @returns {boolean} true if the path exists
   */
  exists (path) {
    const provider = this.fileProviderOf(path)
    const result = provider.exists(path, (err, result) => {
      if (err) return false
      return result
    })

    return result
  }

  /**
   * Verify if the path provided is a file
   * @param {string} path path of the directory or file
   * @returns {boolean} true if path is a file.
   */
  isFile (path) {
    const provider = this.fileProviderOf(path)
    const result = provider.isFile(path)

    return result
  }

    /**
   * Verify if the path provided is a directory
   * @param {string} path path of the directory
   * @returns {boolean} true if path is a directory.
   */
  isDirectory (path) {
    const provider = this.fileProviderOf(path)
    const result = provider.isDirectory(path)

    return result
  }

  /**
   * Open the content of the file in the context (eg: Editor)
   * @param {string} path path of the file
   * @returns {void}
   */
  async open (path) {
    await this._handleExists(path, `Cannot open file ${path}`)
    await this._handleIsFile(path, `Cannot open file ${path}`)
    return this.openFile(path)
  }

  /**
   * Set the content of a specific file
   * @param {string} path path of the file
   * @param {string} data content to write on the file
   * @returns {void}
   */
  async writeFile (path, data) {
    if (await this.exists(path)) {
      await this._handleIsFile(path, `Cannot write file ${path}`)
      return await this.setFileContent(path, data)
    } else {
      return await this.setFileContent(path, data)
    }
  }

  /**
   * Return the content of a specific file
   * @param {string} path path of the file
   * @returns {string} content of the file
   */
  async readFile (path) {
    await this._handleExists(path, `Cannot read file ${path}`)
    await this._handleIsFile(path, `Cannot read file ${path}`)
    return this.getFileContent(path)
  }

  /**
   * Upsert a file with the content of the source file
   * @param {string} src path of the source file
   * @param {string} dest path of the destrination file
   * @returns {void}
   */
  async copyFile (src, dest) {
    await this._handleExists(src, `Cannot copy from ${src}`)
    await this._handleIsFile(src, `Cannot copy from ${src}`)
    await this._handleIsFile(dest, `Cannot paste content into ${dest}`)
    const content = await this.readFile(src)

    await this.writeFile(dest, content)
  }

  /**
   * Change the path of a file/directory
   * @param {string} oldPath current path of the file/directory
   * @param {string} newPath new path of the file/directory
   * @returns {void}
   */
  async rename (oldPath, newPath) {
    await this.__handleExists(oldPath, `Cannot rename ${oldPath}`)
    const isFile = await this.isFile(oldPath)

    this.fileRenamedEvent(oldPath, newPath, !isFile)
  }

  /**
   * Create a directory
   * @param {string} path path of the new directory
   * @returns {void}
   */
  async mkdir (path) {
    if (await this.exists(path)) {
      throw createError({ code: 'EEXIST', message: `Cannot create directory ${path}` })
    }
    const provider = this.fileProviderOf(path)

    provider.createDir(path)
  }

  /**
   * Get the list of files in the directory
   * @param {string} path path of the directory
   * @returns {string[]} list of the file/directory name in this directory
   */
  async readdir (path) {
    await this._handleExists(path)
    await this._handleIsDir(path)

    return new Promise((resolve, reject) => {
      const provider = this.fileProviderOf(path)

      provider.resolveDirectory(path, (error, filesProvider) => {
        if (error) reject(error)
        resolve(filesProvider)
      })
    })
  }

  /**
   * Removes a file or directory recursively
   * @param {string} path path of the directory/file to remove
   * @returns {void}
   */
  async remove (path) {
    await this._handleExists(path, `Cannot remove file or directory ${path}`)
    const provider = this.fileProviderOf(path)

    return await provider.remove(path)
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
    this.getCurrentFile = this.file
    this.getFile = this.readFile
    this.getFolder = this.readdir
    this.setFile = this.writeFile
    this.switchFile = this.open
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
      this.openFile(newName)
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
        this.openFile(newFocus)
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

  getFileContent (path) {
    const provider = this.fileProviderOf(path)

    if (!provider) throw createError({ code: 'ENOENT', message: `${path} not available` })
    // TODO: change provider to Promise
    return new Promise((resolve, reject) => {
      if (this.currentFile() === path) return resolve(this.editor.currentContent())
      provider.get(path, (err, content) => {
        if (err) reject(err)
        resolve(content)
      })
    })
  }

  async setFileContent (path, content) {
    if (this.currentRequest) {
      const canCall = await this.askUserPermission('writeFile', '')
      if (canCall) {
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
    return await this._setFileInternal(path, content)
  }

  _setFileInternal (path, content) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw createError({ code: 'ENOENT', message: `${path} not available` })
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
          copyName = path + '.' + this.currentRequest.from
        }
        this._setFileInternal(copyName, content)
        this.openFile(copyName)
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
    this.openFile()
  }

  unselectCurrentFile () {
    this.saveCurrentFile()
    this._deps.config.set('currentFile', '')
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('noFileSelected')
    this.events.emit('noFileSelected')
  }

  openFile (file) {
    const _openFile = (file) => {
      this.saveCurrentFile()
      const provider = this.fileProviderOf(file)
      if (!provider) return console.error(`no provider for ${file}`)
      file = provider.getPathFromUrl(file) || file // in case an external URL is given as input, we resolve it to the right internal path
      this._deps.config.set('currentFile', file)
      this.openedFiles[file] = file
      provider.get(file, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          if (provider.isReadOnly(file)) {
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
    if (file) return _openFile(file)
    else {
      var browserProvider = this._deps.filesProviders['browser']
      browserProvider.resolveDirectory('browser', (error, filesProvider) => {
        if (error) console.error(error)
        var fileList = Object.keys(filesProvider)
        if (fileList.length) {
          _openFile(browserProvider.type + '/' + fileList[0])
        } else {
          // TODO: Only keep `this.emit` (issue#2210)
          this.emit('noFileSelected')
          this.events.emit('noFileSelected')
        }
      })
    }
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
