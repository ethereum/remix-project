'use strict'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { Registry } from '@remix-project/remix-lib'
import { fileChangedToastMsg, recursivePasteToastMsg, storageFullMessage } from '@remix-ui/helper'
import helper from '../../lib/helper.js'
import { RemixAppManager } from '../../remixAppManager'
import { commitChange } from '@remix-ui/git'

const profile = {
  name: 'fileManager',
  displayName: 'File manager',
  description: 'Service - read/write to any files or folders, require giving permissions',
  icon: 'assets/img/fileManager.webp',
  permission: true,
  version: packageJson.version,
  methods: [
    'closeAllFiles', 'closeFile', 'file', 'exists', 'open', 'writeFile', 'writeMultipleFiles',
    'writeFileNoRewrite', 'readFile', 'copyFile', 'copyDir', 'rename', 'mkdir', 'readdir',
    'dirList', 'fileList', 'remove', 'getCurrentFile', 'getFile', 'getFolder', 'setFile',
    'switchFile', 'refresh', 'getProviderOf', 'getProviderByName', 'getPathFromUrl',
    'getUrlFromPath', 'saveCurrentFile', 'setBatchFiles', 'isGitRepo', 'isFile', 'isDirectory',
    'hasGitSubmodule', 'copyFolderToJson', 'diff', 'hasGitSubmodules', 'getOpenedFiles'
  ],
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

export default class FileManager extends Plugin {
  mode: string
  openedFiles: any
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
    this.openedFiles = {}
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
    return path.replace(/^\/browser\//, '').replace(/^browser\//, '')
  }

  normalize(path) {
    return path.replace(/^\/+/, '')
  }

  async _handleExists(path: string, message?: string) {
    const exists = await this.exists(path)
    if (!exists) {
      throw createError({ code: 'ENOENT', message })
    }
  }

  async _handleIsFile(path, message) {
    const isFile = await this.isFile(path)
    if (!isFile) {
      throw createError({ code: 'EISDIR', message })
    }
  }

  async _handleIsDir(path: string, message?: string) {
    const isDir = await this.isDirectory(path)
    if (!isDir) {
      throw createError({ code: 'ENOTDIR', message })
    }
  }

  file() {
    try {
      const file = this.currentFile()
      if (!file) throw createError({ code: 'ENOENT', message: 'No file selected' })
      return file
    } catch (e) {
      throw new Error(e)
    }
  }

  async exists(path) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      const provider = this.fileProviderOf(path)
      return await provider.exists(path)
    } catch (e) {
      throw new Error(e)
    }
  }

  refresh() {
    const provider = this.fileProviderOf('/')
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      provider.event.emit('refresh')
    } else {
      provider.event.emit('rootFolderChanged', provider.workspace || '/')
      this.emit('rootFolderChanged', provider.workspace || '/')
    }
  }

  async isFile(path) {
    const provider = this.fileProviderOf(path)
    return await provider.isFile(path)
  }

  async isDirectory(path) {
    const provider = this.fileProviderOf(path)
    return await provider.isDirectory(path)
  }

  async open(path) {
    path = this.normalize(path)
    path = this.limitPluginScope(path)
    path = this.getPathFromUrl(path).file
    await this._handleExists(path, `Cannot open file ${path}`)
    await this._handleIsFile(path, `Cannot open file ${path}`)
    await this.openFile(path)
  }

  async writeFile(path, data, options?) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      if (await this.exists(path)) {
        await this._handleIsFile(path, `Cannot write file ${path}`)
        return await this.setFileContent(path, data, options)
      } else {
        const ret = await this.setFileContent(path, data, options)
        this.emit('fileAdded', path)
        return ret
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  async writeMultipleFiles(filePaths: string[], fileData: string[], folderPath: string) {
    if (this.currentRequest) {
      const canCall = await this.askUserPermission(`writeFile`, `will write multiple files to ${folderPath}...`)
      const required = this.appManager.isRequired(this.currentRequest.from)
      if (canCall && !required) {
        this.call('notification', 'toast', fileChangedToastMsg(this.currentRequest.from, folderPath))
      }
    }
    try {
      for (let i = 0; i < filePaths.length; i++) {
        const installPath = folderPath + '/' + filePaths[i]
        let path = this.normalize(installPath)
        path = this.limitPluginScope(path)
        if (!await this.exists(path)) {
          await this._setFileInternal(path, fileData[i])
          this.emit('fileAdded', path)
        }
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  async writeFileNoRewrite(path, data) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      if (await this.exists(path)) {
        const newPath = await helper.createNonClashingNameAsync(path, this)
        const content = await this.setFileContent(newPath, data)
        return { newContent: content, newPath }
      } else {
        const ret = await this.setFileContent(path, data)
        this.emit('fileAdded', path)
        return { newContent: ret, newPath: path }
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  // Changed to async/await to eliminate the old TODO:
  async readFile(path, options?) {
    try {
      path = this.normalize(path)
      path = this.limitPluginScope(path)
      await this._handleExists(path, `Cannot read file ${path}`)
      await this._handleIsFile(path, `Cannot read file ${path}`)
      return await this.getFileContent(path, options)
    } catch (e) {
      throw new Error(e)
    }
  }

  async copyFile(src: string, dest: string, customName?: string) {
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
      let copiedFilePath = dest + (customName ? '/' + customName : '/' + helper.extractNameFromKey(src))
      copiedFilePath = await helper.createNonClashingNameAsync(copiedFilePath, this)
      await this.writeFile(copiedFilePath, content)
    } catch (e) {
      throw new Error(e)
    }
  }

  async copyDir(src: string, dest: string, customName?: string) {
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
        await this.inDepthCopy(src, dest, customName)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  async inDepthCopy(src: string, dest: string, customName?: string) {
    const content = await this.readdir(src)
    let copiedFolderPath = !customName ? dest + '/' + `Copy_${helper.extractNameFromKey(src)}` : dest + '/' + helper.extractNameFromKey(src)
    copiedFolderPath = await helper.createNonClashingDirNameAsync(copiedFolderPath, this)

    await this.mkdir(copiedFolderPath)

    for (const [key, value] of Object.entries(content)) {
      if (!value.isDirectory) {
        await this.copyFile(key, copiedFolderPath, helper.extractNameFromKey(key))
      } else {
        await this.inDepthCopy(key, copiedFolderPath, helper.extractNameFromKey(key))
      }
    }
  }

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

  async zipDir(dirPath, zip) {
    const filesAndFolders = await this.readdir(dirPath)
    for (let path in filesAndFolders) {
      if (filesAndFolders[path].isDirectory) await this.zipDir(path, zip)
      else {
        path = this.normalize(path)
        const content: any = await this.readFile(path)
        zip.file(path, content)
      }
    }
  }

  async download(path) {
    try {
      const downloadFileName = helper.extractNameFromKey(path)
      if (await this.isDirectory(path)) {
        const zip = new JSZip()
        await this.zipDir(path, zip)
        const content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, `${downloadFileName}.zip`)
      } else {
        path = this.normalize(path)
        const content: any = await this.readFile(path)
        saveAs(new Blob([content]), downloadFileName)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

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

  async readdir(path): Promise<Record<string, Record<string, boolean>>> {
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
      return {}
    }
  }

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
      filesProviders: this._components.registry.get('fileproviders').api,
      electronExplorer: this._components.registry.get('fileproviders/electron').api
    }

    this._deps.config.set('currentFile', '')

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
    this._deps.electronExplorer.event.on('fileChanged', (path) => { this.fileChangedEvent(path) })
    this._deps.electronExplorer.event.on('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this._deps.electronExplorer.event.on('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this._deps.electronExplorer.event.on('fileAdded', (path) => { this.fileAddedEvent(path) })

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
    this.emit('fileRenamed', oldName, newName, isFolder)
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
    this.emit('filesAllClosed')
    for (const file in this.openedFiles) {
      await this.closeFile(file)
    }
  }

  async closeFile(name) {
    delete this.openedFiles[name]
    if (!Object.keys(this.openedFiles).length) {
      this._deps.config.set('currentFile', '')
      this.emit('noFileSelected')
    }
    this.emit('fileClosed', name)
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

  // Converted to async/await, removing the old TODO about promises:
  async getFileContent(path, options?) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw createError({ code: 'ENOENT', message: `${path} not available` })

    if (this.currentFile() === path) {
      const editorContent = this.editor.currentContent()
      if (editorContent) return editorContent
    }
    return await new Promise((resolve, reject) => {
      provider.get(path, (err, content) => {
        if (err) reject(err)
        else resolve(content)
      }, options)
    })
  }

  // Removed the old TODO, since we already ask for permission in setFileContent:
  async _setFileInternal(path, content, options?) {
    const provider = this.fileProviderOf(path)
    if (!provider) throw createError({ code: 'ENOENT', message: `${path} not available` })

    return new Promise((resolve, reject) => {
      provider.set(path, content, async (error) => {
        if (error) reject(error)
        this.syncEditor(path)
        this.emit('fileSaved', path)
        resolve(true)
      }, options)
    })
  }

  async setFileContent(path, content, options?) {
    if (this.currentRequest) {
      const canCall = await this.askUserPermission(`writeFile`, `modifying ${path} ...`)
      const required = this.appManager.isRequired(this.currentRequest.from)
      if (canCall && !required) {
        this.call('notification', 'toast', fileChangedToastMsg(this.currentRequest.from, path))
      }
    }
    return await this._setFileInternal(path, content, options)
  }

  getPathFromUrl(file) {
    const provider = this.fileProviderOf(file)
    if (!provider) throw new Error(`no provider for ${file}`)
    return {
      file: provider.getPathFromUrl(file) || file,
      provider
    }
  }

  getUrlFromPath(file) {
    const provider = this.fileProviderOf(file)
    if (!provider) throw new Error(`no provider for ${file}`)
    return {
      file: provider.getUrlFromPath(file) || file,
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
    this.emit('fileRemoved', path)
    if (path === this._deps.config.get('currentFile')) {
      this.openFile(this._deps.config.get('currentFile'))
    }
  }

  async unselectCurrentFile() {
    await this.saveCurrentFile()
    this._deps.config.set('currentFile', '')
    this.emit('noFileSelected')
  }

  async diff(change: commitChange) {
    await this.saveCurrentFile()
    this._deps.config.set('currentFile', '')
    this.emit('noFileSelected')

    if (!change.readonly) {
      let file = this.normalize(change.path)
      const resolved = this.getPathFromUrl(file)
      file = resolved.file
      this._deps.config.set('currentFile', file)
      this.openedFiles[file] = file
    }
    await this.editor.openDiff(change)
    this.emit('openDiff', change)
  }

  async closeDiff(change: commitChange) {
    if (!change.readonly) {
      const file = this.normalize(change.path)
      delete this.openedFiles[file]
      if (!Object.keys(this.openedFiles).length) {
        this._deps.config.set('currentFile', '')
        this.emit('noFileSelected')
      }
    }
    this.emit('closeDiff', change)
  }

  async openFile(file?: string) {
    if (!file) {
      this.emit('noFileSelected')
    } else {
      file = this.normalize(file)
      const resolved = this.getPathFromUrl(file)
      file = resolved.file
      await this.saveCurrentFile()

      if (this.currentFile() === file && !this.editor.isDiff) return

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
      try {
        await this.editor.handleTypeScriptDependenciesOf(
          file, content,
          path => this.readFile(path),
          path => this.exists(path)
        )
      } catch (e) {
        console.log('unable to handle TypeScript dependencies of', file)
      }
      if (provider.isReadOnly(file)) {
        await this.editor.openReadOnly(file, content)
      } else {
        await this.editor.open(file, content)
      }
      this.emit('currentFileChanged', file)
      return true
    }
  }

  async getProviderOf(file) {
    const cancall = await this.askUserPermission('getProviderByName')
    if (cancall) {
      return file ? this.fileProviderOf(file) : this.currentFileProvider()
    }
  }

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
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      return this._deps.filesProviders.electron
    }
    return this._deps.filesProviders.workspace
  }

  dirList(path) {
    const dirPaths = []
    const collectList = (path) => {
      return new Promise((resolve, reject) => {
        this.readdir(path).then((ls) => {
          const promises = Object.keys(ls).map((item) => {
            if (ls[item].isDirectory && !dirPaths.includes(item)) {
              dirPaths.push(item)
              resolve(dirPaths)
            }
            return Promise.resolve(true)
          })
          Promise.all(promises).then(() => { resolve(dirPaths) })
        })
      })
    }
    return collectList(path)
  }

  async fileList(dirPath) {
    const paths: any = await this.readdir(dirPath)
    for (const path in paths) {
      if (paths[path].isDirectory) delete paths[path]
    }
    return Object.keys(paths)
  }

  isRemixDActive() {
    return this.appManager.isActive('remixd')
  }

  async saveCurrentFile() {
    const currentFile = this._deps.config.get('currentFile')
    if (currentFile && this.editor.current()) {
      const input = this.editor.get(currentFile)
      if (input !== null && input !== undefined) {
        const provider = this.fileProviderOf(currentFile)
        if (provider) {
          const oldContent = await new Promise((resolve, reject) => {
            provider.get(currentFile, (error, content) => {
              if (error) reject(error)
              else resolve(content)
            })
          })
          try {
            await new Promise<void>((resolve, reject) => {
              provider.set(currentFile, input, (error) => {
                if (error) reject(error)
                else resolve()
              })
            })
            this.emit('fileSaved', currentFile)
          } catch (error) {
            if (error.message) {
              this.call(
                'notification',
                'toast',
                error.message.indexOf('LocalStorage is full') !== -1
                  ? storageFullMessage()
                  : error.message
              )
            }
            // revert to old content
            await new Promise<void>((resolve) => {
              provider.set(currentFile, oldContent, () => resolve())
            })
            console.error(error)
          }
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
      try {
        const content = await provider.get(currentFile)
        if (content) this.editor.setText(currentFile, content)
      } catch (error) {
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
        try {
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
        } catch (error) {
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
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      return ''
    }
    if (this.mode !== 'localhost') {
      const file = this.currentFile() || ''
      const provider = this.fileProviderOf(file)
      return provider.workspace
    }
  }

  async isGitRepo(): Promise<boolean> {
    const path = '.git'
    return await this.exists(path)
  }

  async hasGitSubmodules(): Promise<boolean> {
    const path = '.gitmodules'
    return await this.exists(path)
  }

  async moveFileIsAllowed (src: string, dest: string) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot move ${src}. Path does not exist.`)
      await this._handleExists(dest, `Cannot move content into ${dest}. Path does not exist.`)
      await this._handleIsFile(src, `Cannot move ${src}. Path is not a file.`)
      await this._handleIsDir(dest, `Cannot move content into ${dest}. Path is not directory.`)
      const fileName = helper.extractNameFromKey(src)
      if (await this.exists(dest + '/' + fileName)) {
        return false
      }
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async moveDirIsAllowed (src: string, dest: string) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot move ${src}. Path does not exist.`)
      await this._handleExists(dest, `Cannot move content into ${dest}. Path does not exist.`)
      await this._handleIsDir(src, `Cannot move ${src}. Path is not directory.`)
      await this._handleIsDir(dest, `Cannot move content into ${dest}. Path is not directory.`)
      const dirName = helper.extractNameFromKey(src)
      const provider = this.fileProviderOf(src)
      if (await this.exists(dest + '/' + dirName) || src === dest) {
        return false
      }
      if (provider.isSubDirectory(src, dest)) {
        this.call('notification', 'toast', recursivePasteToastMsg())
        return false
      }
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async moveFile(src: string, dest: string) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot move ${src}. Path does not exist.`)
      await this._handleExists(dest, `Cannot move content into ${dest}. Path does not exist.`)
      await this._handleIsFile(src, `Cannot move ${src}. Path is not a file.`)
      await this._handleIsDir(dest, `Cannot move content into ${dest}. Path is not directory.`)
      const fileName = helper.extractNameFromKey(src)
      if (await this.exists(dest + '/' + fileName)) {
        throw createError({ code: 'EEXIST', message: `Cannot move ${src}. File already exists at destination ${dest}` })
      }
      await this.copyFile(src, dest, fileName)
      await this.remove(src)
    } catch (e) {
      throw new Error(e)
    }
  }

  async moveDir(src: string, dest: string) {
    try {
      src = this.normalize(src)
      dest = this.normalize(dest)
      src = this.limitPluginScope(src)
      dest = this.limitPluginScope(dest)
      await this._handleExists(src, `Cannot move ${src}. Path does not exist.`)
      await this._handleExists(dest, `Cannot move content into ${dest}. Path does not exist.`)
      await this._handleIsDir(src, `Cannot move ${src}. Path is not directory.`)
      await this._handleIsDir(dest, `Cannot move content into ${dest}. Path is not directory.`)
      const dirName = helper.extractNameFromKey(src)
      if (await this.exists(dest + '/' + dirName) || src === dest) {
        throw createError({ code: 'EEXIST', message: `Cannot move ${src}. Folder already exists at destination ${dest}` })
      }
      const provider = this.fileProviderOf(src)
      if (provider.isSubDirectory(src, dest)) {
        this.call('notification', 'toast', recursivePasteToastMsg())
        return false
      }
      await this.inDepthCopy(src, dest, dirName)
      await this.remove(src)
    } catch (e) {
      throw new Error(e)
    }
  }

  async copyFolderToJson(folder: string) {
    const provider = this.currentFileProvider()
    if (provider && provider.copyFolderToJson) {
      return await provider.copyFolderToJson(folder)
    }
    throw new Error('copyFolderToJson not available')
  }
}

module.exports = FileManager
