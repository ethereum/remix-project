'use strict'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import Registry from '../state/registry'
import { EventEmitter } from 'events'
import { RemixAppManager } from '../../../../../libs/remix-ui/plugin-manager/src/types'
import { fileChangedToastMsg, recursivePasteToastMsg, storageFullMessage } from '@remix-ui/helper'
import helper from '../../lib/helper.js'

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
  methods: ['closeAllFiles', 'closeFile', 'file', 'exists', 'open', 'writeFile', 'readFile', 'copyFile', 'copyDir', 'rename', 'mkdir', 'readdir', 'dirList', 'fileList', 'remove', 'getCurrentFile', 'getFile', 'getFolder', 'setFile', 'switchFile', 'refresh', 'getProviderOf', 'getProviderByName', 'getPathFromUrl', 'getUrlFromPath', 'saveCurrentFile', 'setBatchFiles'],
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
  mode: string
  openedFiles: any
  events: EventEmitter
  editor: any
  _components: any
  appManager: RemixAppManager
  _deps: any
  getCurrentFile: () => any
  getFile: (path: any) => Promise<unknown>
  getFolder: (path: any) => Promise<unknown>
  setFile: (path: any, data: any) => Promise<unknown>
  switchFile: (path: any) => Promise<void>
  constructor(editor, appManager) {
    super(profile)
    this.mode = 'browser'
    this.openedFiles = {} // list all opened files
    this.events = new EventEmitter()
    this.editor = editor
    this._components = {}
    this._components.registry = Registry.getInstance()
    this.appManager = appManager
    this.init()
  }

  getOpenedFiles() {
    return this.openedFiles
  }

  setMode(mode) {
    this.mode = mode
  }

  limitPluginScope(path) {
    return path.replace(/^\/browser\//, '').replace(/^browser\//, '') // forbids plugin to access the root filesystem
  }

  normalize(path) {
    return path.replace(/^\/+/, '')
  }

  /**
   * Emit error if path doesn't exist
   * @param {string} path path of the file/directory
   * @param {string} message message to display if path doesn't exist.
   */
  async _handleExists(path: string, message?: string) {
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
  async _handleIsFile(path, message) {
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
  async _handleIsDir(path: string, message?: string) {
    const isDir = await this.isDirectory(path)

    if (!isDir) {
      throw createError({ code: 'ENOTDIR', message })
    }
  }

  /** The current opened file */
  file() {
    try {
      const file = this.currentFile()

      if (!file) throw createError({ code: 'ENOENT', message: 'No file selected' })
      return file
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Verify if the path exists (directory or file)
   * @param {string} path path of the directory or file
   * @returns {boolean} true if the path exists
   */
  async exists(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      const provider = this.fileProviderOf(path)
      const result = await provider.exists(path)

      return result
    } catch (e) {
      throw new Error(e)
    }
  }

  /*
  * refresh the file explorer
  */
  refresh() {
    const provider = this.fileProviderOf('/')
    // emit rootFolderChanged so that File Explorer reloads the file tree
    provider.event.emit('rootFolderChanged', provider.workspace || '/')
    this.emit('rootFolderChanged', provider.workspace || '/')
  }

  /**
   * Verify if the path provided is a file
   * @param {string} path path of the directory or file
   * @returns {boolean} true if path is a file.
   */
  async isFile(path) {
    const provider = this.fileProviderOf(path)
    const result = await provider.isFile(path)
    return result
  }

  /**
   * Verify if the path provided is a directory
   * @param {string} path path of the directory
   * @returns {boolean} true if path is a directory.
   */
  async isDirectory(path) {
    const provider = this.fileProviderOf(path)
    const result = await provider.isDirectory(path)

    return result
  }

  /**
   * Open the content of the file in the context (eg: Editor)
   * @param {string} path path of the file
   * @returns {void}
   */
  async open(path) {
    path = this.normalize(path)
    path = this.limitPluginScope(path)
    path = this.getPathFromUrl(path).file
    await this._handleExists(path, `Cannot open file ${path}`)
    await this._handleIsFile(path, `Cannot open file ${path}`)
    await this.openFile(path)
  }

  /**
   * Set the content of a specific file
   * @param {string} path path of the file
   * @param {string} data content to write on the file
   * @returns {void}
   */
  async writeFile(path, data) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      if (await this.exists(path)) {
        await this._handleIsFile(path, `Cannot write file ${path}`)
        return await this.setFileContent(path, data)
      } else {
        const ret = await this.setFileContent(path, data)
        this.emit('fileAdded', path)
        return ret
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Return the content of a specific file
   * @param {string} path path of the file
   * @returns {string} content of the file
   */
  async readFile(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      await this._handleExists(path, `Cannot read file ${path}`)
      await this._handleIsFile(path, `Cannot read file ${path}`)
      return this.getFileContent(path)
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Upsert a file with the content of the source file
   * @param {string} src path of the source file
   * @param {string} dest path of the destrination file
   * @returns {void}
   */
  async copyFile(src, dest, customName) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot copy from ${src}. Path does not exist.`)
      await this._handleIsFile(src, `Cannot copy from ${src}. Path is not a file.`)
      await this._handleExists(dest, `Cannot paste content into ${dest}. Path does not exist.`)
      await this._handleIsDir(dest, `Cannot paste content into ${dest}. Path is not directory.`)
      const content = await this.readFile(src)
      let copiedFilePath = dest + (customName ? '/' + customName : '/' + `Copy_${helper.extractNameFromKey(src)}`)
      copiedFilePath = await helper.createNonClashingNameAsync(copiedFilePath, this)

      await this.writeFile(copiedFilePath, content)
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Upsert a directory with the content of the source directory
   * @param {string} src path of the source dir
   * @param {string} dest path of the destination dir
   * @returns {void}
   */
  async copyDir(src, dest) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot copy from ${src}. Path does not exist.`)
      await this._handleIsDir(src, `Cannot copy from ${src}. Path is not a directory.`)
      await this._handleExists(dest, `Cannot paste content into ${dest}. Path does not exist.`)
      await this._handleIsDir(dest, `Cannot paste content into ${dest}. Path is not directory.`)

      const provider = this.fileProviderOf(src)
      if (provider.isSubDirectory(src, dest)) {
        this.call('notification', 'toast', recursivePasteToastMsg())
      } else {
        await this.inDepthCopy(src, dest)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  async inDepthCopy(src, dest, count = 0) {
    const content = await this.readdir(src)
    let copiedFolderPath = count === 0 ? dest + '/' + `Copy_${helper.extractNameFromKey(src)}` : dest + '/' + helper.extractNameFromKey(src)
    copiedFolderPath = await helper.createNonClashingDirNameAsync(copiedFolderPath, this)

    await this.mkdir(copiedFolderPath)

    for (const [key, value] of Object.entries(content)) {
      if (!value.isDirectory) {
        await this.copyFile(key, copiedFolderPath, helper.extractNameFromKey(key))
      } else {
        await this.inDepthCopy(key, copiedFolderPath, count + 1)
      }
    }
  }

  /**
   * Change the path of a file/directory
   * @param {string} oldPath current path of the file/directory
   * @param {string} newPath new path of the file/directory
   * @returns {void}
   */
  async rename(oldPath, newPath) {
    try {
      oldPath = this.normalize(oldPath)
      newPath = this.normalize(newPath)
      oldPath = this.limitPluginScope(oldPath)
      newPath = this.limitPluginScope(newPath)
      await this._handleExists(oldPath, `Cannot rename ${oldPath}`)
      const isFile = await this.isFile(oldPath)
      const newPathExists = await this.exists(newPath)
      const provider = this.fileProviderOf(oldPath)

      if (isFile) {
        if (newPathExists) {
          this.call('notification', 'alert', {
            id: 'fileManagerAlert',
            message: 'File already exists'
          })
          return
        }
        return provider.rename(oldPath, newPath, false)
      } else {
        if (newPathExists) {
          this.call('notification', 'alert', {
            id: 'fileManagerAlert',
            message: 'Directory already exists'
          })
          return
        }
        return provider.rename(oldPath, newPath, true)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Create a directory
   * @param {string} path path of the new directory
   * @returns {void}
   */
  async mkdir(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      if (await this.exists(path)) {
        throw createError({ code: 'EEXIST', message: `Cannot create directory ${path}` })
      }
      const provider = this.fileProviderOf(path)
      return await provider.createDir(path)
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Get the list of files in the directory
   * @param {string} path path of the directory
   * @returns {string[]} list of the file/directory name in this directory
   */
  async readdir(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      await this._handleExists(path)
      await this._handleIsDir(path)

      return new Promise((resolve, reject) => {
        const provider = this.fileProviderOf(path)

        provider.resolveDirectory(path, (error, filesProvider) => {
          if (error) reject(error)
          resolve(filesProvider)
        })
      })
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Removes a file or directory recursively
   * @param {string} path path of the directory/file to remove
   * @returns {void}
   */
  async remove(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      await this._handleExists(path, `Cannot remove file or directory ${path}`)
      const provider = this.fileProviderOf(path)
      return await provider.remove(path)
    } catch (e) {
      throw new Error(e)
    }
  }

  init() {
    this._deps = {
      config: this._components.registry.get('config').api,
      browserExplorer: this._components.registry.get('fileproviders/browser').api,
      localhostExplorer: this._components.registry.get('fileproviders/localhost').api,
      workspaceExplorer: this._components.registry.get('fileproviders/workspace').api,
      filesProviders: this._components.registry.get('fileproviders').api
    }

    this._deps.config.set('currentFile', '') // make sure we remove the current file from the previous session

    this._deps.browserExplorer.event.on('fileChanged', (path) => { this.fileChangedEvent(path) })
    this._deps.browserExplorer.event.on('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.localhostExplorer.event.on('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.browserExplorer.event.on('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.browserExplorer.event.on('fileAdded', (path) => { this.fileAddedEvent(path) })
    this._deps.localhostExplorer.event.on('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.localhostExplorer.event.on('errored', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
    this._deps.localhostExplorer.event.on('closed', (event) => { this.removeTabsOf(this._deps.localhostExplorer) })
    this._deps.workspaceExplorer.event.on('fileChanged', (path) => { this.fileChangedEvent(path) })
    this._deps.workspaceExplorer.event.on('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.workspaceExplorer.event.on('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.workspaceExplorer.event.on('fileAdded', (path) => { this.fileAddedEvent(path) })

    this.getCurrentFile = this.file
    this.getFile = this.readFile
    this.getFolder = this.readdir
    this.setFile = this.writeFile
    this.switchFile = this.open
  }

  fileAddedEvent(path) {
    this.emit('fileAdded', path)
  }

  fileChangedEvent(path) {
    this.emit('fileChanged', path)
  }

  fileRenamedEvent(oldName, newName, isFolder) {
    if (!isFolder) {
      this._deps.config.set('currentFile', '')
      this.editor.discard(oldName)
      if (this.openedFiles[oldName]) {
        delete this.openedFiles[oldName]
        this.openedFiles[newName] = newName
      }
      this.openFile(newName)
    } else {
      for (const k in this.openedFiles) {
        if (k.indexOf(oldName + '/') === 0) {
          const newAbsolutePath = k.replace(oldName, newName)
          this.openedFiles[newAbsolutePath] = newAbsolutePath
          delete this.openedFiles[k]
          if (this._deps.config.get('currentFile') === k) {
            this._deps.config.set('currentFile', '')
          }
        }
      }
    }
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('fileRenamed', oldName, newName, isFolder)
    this.events.emit('fileRenamed', oldName, newName, isFolder)
  }

  currentFileProvider() {
    const path = this.currentPath()
    if (path) {
      return this.fileProviderOf(path)
    }
    return null
  }

  currentFile() {
    return this.editor.current()
  }

  async closeAllFiles() {
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('filesAllClosed')
    this.events.emit('filesAllClosed')
    for (const file in this.openedFiles) {
      await this.closeFile(file)
    }
  }

  async closeFile(name) {
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

  currentPath() {
    const currentFile = this._deps.config.get('currentFile')
    return this.extractPathOf(currentFile)
  }

  extractPathOf(file) {
    const reg = /(.*)(\/).*/
    const path = reg.exec(file)
    return path ? path[1] : '/'
  }

  getFileContent(path) {
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

  async setFileContent(path, content) {
    if (this.currentRequest) {
      const canCall = await this.askUserPermission('writeFile', '')
      const required = this.appManager.isRequired(this.currentRequest.from)
      if (canCall && !required) {
        // inform the user about modification after permission is granted and even if permission was saved before
        this.call('notification', 'toast', fileChangedToastMsg(this.currentRequest.from, path))
      }
    }
    return await this._setFileInternal(path, content)
  }

  _setFileInternal(path, content) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw createError({ code: 'ENOENT', message: `${path} not available` })
    // TODO : Add permission
    // TODO : Change Provider to Promise
    return new Promise((resolve, reject) => {
      provider.set(path, content, (error) => {
        if (error) reject(error)
        this.syncEditor(path)
        this.emit('fileSaved', path)
        resolve(true)
      })
    })
  }

  /**
   * Try to resolve the given file path (the actual path in the file system)
   * e.g if it's specified a github link, npm library, or any external content,
   * it returns the actual path where the content can be found.
   * @param {string} file url we are trying to resolve
   * @returns {{ string, provider }} file path resolved and its provider.
   */
  getPathFromUrl(file) {
    const provider = this.fileProviderOf(file)
    if (!provider) throw new Error(`no provider for ${file}`)
    return {
      file: provider.getPathFromUrl(file) || file, // in case an external URL is given as input, we resolve it to the right internal path
      provider
    }
  }

  /**
   * Try to resolve the given file URl. opposite of getPathFromUrl
   * @param {string} file path we are trying to resolve
   * @returns {{ string, provider }} file url resolved and its provider.
   */
  getUrlFromPath(file) {
    const provider = this.fileProviderOf(file)
    if (!provider) throw new Error(`no provider for ${file}`)
    return {
      file: provider.getUrlFromPath(file) || file, // in case an external URL is given as input, we resolve it to the right internal path
      provider
    }
  }

  removeTabsOf(provider) {
    for (const tab in this.openedFiles) {
      if (this.fileProviderOf(tab).type === provider.type) {
        this.fileRemovedEvent(tab)
      }
    }
  }

  fileRemovedEvent(path) {
    if (path === this._deps.config.get('currentFile')) {
      this._deps.config.set('currentFile', '')
    }
    this.editor.discard(path)
    delete this.openedFiles[path]
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('fileRemoved', path)
    this.events.emit('fileRemoved', path)
    this.openFile(this._deps.config.get('currentFile'))
  }

  async unselectCurrentFile() {
    await this.saveCurrentFile()
    this._deps.config.set('currentFile', '')
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('noFileSelected')
    this.events.emit('noFileSelected')
  }

  async openFile(file?: string) {
    if (!file) {
      this.emit('noFileSelected')
      this.events.emit('noFileSelected')
    } else {
      file = this.normalize(file)
      const resolved = this.getPathFromUrl(file)
      file = resolved.file
      await this.saveCurrentFile()
      if (this.currentFile() === file) return
      const provider = resolved.provider
      this._deps.config.set('currentFile', file)
      this.openedFiles[file] = file

      let content = ''
      try {
        content = await provider.get(file)   
      } catch (error) {
        console.log(error)
        throw error
      }
      if (provider.isReadOnly(file)) {
        this.editor.openReadOnly(file, content)
      } else {
        this.editor.open(file, content)
      }
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('currentFileChanged', file)
      this.events.emit('currentFileChanged', file)
      return true      
    }
  }

  /**
  * Async API method getProviderOf
  * @param {string} file
  *
  */

  async getProviderOf(file) {
    const cancall = await this.askUserPermission('getProviderByName')
    if (cancall) {
      return file ? this.fileProviderOf(file) : this.currentFileProvider()
    }
  }

  /**
  * Async API method getProviderByName
  * @param {string} name
  *
  */

  async getProviderByName(name) {
    const cancall = await this.askUserPermission('getProviderByName')
    if (cancall) {
      return this.getProvider(name)
    }
  }

  getProvider(name) {
    return this._deps.filesProviders[name]
  }

  fileProviderOf(file) {
    if (file.startsWith('localhost') || this.mode === 'localhost') {
      return this._deps.filesProviders.localhost
    }
    if (file.startsWith('browser')) {
      return this._deps.filesProviders.browser
    }
    return this._deps.filesProviders.workspace
  }

  // returns the list of directories inside path
  dirList(path) {
    const dirPaths = []
    const collectList = (path) => {
      return new Promise((resolve, reject) => {
        this.readdir(path).then((ls) => {
          const promises = Object.keys(ls).map((item, index) => {
            if (ls[item].isDirectory && !dirPaths.includes(item)) {
              dirPaths.push(item)
              resolve(dirPaths)
            }
            return new Promise((resolve, reject) => { resolve(true) })
          })
          Promise.all(promises).then(() => { resolve(dirPaths) })
        })
      })
    }
    return collectList(path)
  }

  async fileList (dirPath) {
    const paths: any = await this.readdir(dirPath)
    for( const path in paths)
      if(paths[path].isDirectory) delete paths[path]
    return Object.keys(paths)
  }

  isRemixDActive () {
    return this.appManager.isActive('remixd')
  }

  async saveCurrentFile() {
    const currentFile = this._deps.config.get('currentFile')
    if (currentFile && this.editor.current()) {
      const input = this.editor.get(currentFile)
      if ((input !== null) && (input !== undefined)) {
        const provider = this.fileProviderOf(currentFile)
        if (provider) {
          // use old content as default if save operation fails.
          provider.get(currentFile, (error, oldContent) => {
            provider.set(currentFile, input, (error) => {
              if (error) {
                if (error.message ) this.call('notification', 'toast', 
                  error.message.indexOf(
                    'LocalStorage is full') !== -1 ? storageFullMessage()
                    : error.message
                )
                provider.set(currentFile, oldContent)
                return console.error(error)
              } else {
          this.emit('fileSaved', currentFile)
              }
            })
          })
        } else {
          console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
        }
      }
    }
  }

  async syncEditor(path) {
    const currentFile = this._deps.config.get('currentFile')
    if (path !== currentFile) return
    const provider = this.fileProviderOf(currentFile)
    if (provider) {
      try{
        const content = await provider.get(currentFile)
        if(content) this.editor.setText(content)
      }catch(error){
        console.log(error)
      }
    } else {
      console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
    }
  }

  async setBatchFiles(filesSet, fileProvider, override, callback) {
    const self = this
    if (!fileProvider) fileProvider = 'workspace'
    if (override === undefined) override = false
    for (const file of Object.keys(filesSet)) {
      if (override) {
        try {
          await self._deps.filesProviders[fileProvider].set(file, filesSet[file].content)
        } catch (e) {
          callback(e.message || e)
        }
        await self.syncEditor(fileProvider + file)
      } else {
        try{
          const name = await helper.createNonClashingNameAsync(file, self._deps.filesProviders[fileProvider])
          if (helper.checkSpecialChars(name)) {
            this.call('notification', 'alert', {
              id: 'fileManagerAlert',
              message: 'Special characters are not allowed in file names.'
            })
          } else {
            try {
              await self._deps.filesProviders[fileProvider].set(name, filesSet[file].content)
            } catch (e) {
              return callback(e.message || e)
            }
            self.syncEditor(fileProvider + name)
          }
        }catch(error){
          if (error) {
            this.call('notification', 'alert', {
              id: 'fileManagerAlert',
              message: 'Unexpected error loading file ' + file + ': ' + error
            })
          }
        }
      }
    }
    callback()
  }

  currentWorkspace() {
    if (this.mode !== 'localhost') {
      const file = this.currentFile() || ''
      const provider = this.fileProviderOf(file)

      return provider.workspace
    }
  }
}

module.exports = FileManager
