import FileProvider from "./fileProvider"

declare global {
  interface Window {
    remixFileSystem: any
  }
}

export class ElectronProvider extends FileProvider {
  _appManager: any
  constructor(appManager) {
    super('')
    this._appManager = appManager

  }

  async init() {
    this._appManager.on('fs', 'change', async (event, path) => {
      this.handleEvent(event, path)
    })
    this._appManager.on('fs', 'eventGroup', async (data) => {
      for (const event of data) {
        this.handleEvent(event.payload[0], event.payload[1])
      }
    })
  }

  handleEvent = (event, path) => {
    switch (event) {
    case 'add':
      this.event.emit('fileAdded', path)
      break
    case 'unlink':
      this.event.emit('fileRemoved', path)
      break
    case 'change':
      this.get(path, (_error, content) => {
        this.event.emit('fileExternallyChanged', path, content, false)
      })
      break
    case 'rename':
      this.event.emit('fileRenamed', path)
      break
    case 'addDir':
      this.event.emit('folderAdded', path)
      break
    case 'unlinkDir':
      this.event.emit('fileRemoved', path)
    }
  }

  // isDirectory is already included
  // this is a more efficient version of the default implementation
  async resolveDirectory(path, cb) {
    path = this.removePrefix(path)
    if (path.indexOf('/') !== 0) path = '/' + path
    try {
      const files = await window.remixFileSystem.readdir(path)
      const ret = {}
      if (files) {
        for (const element of files) {
          path = path.replace(/^\/|\/$/g, '') // remove first and last slash
          const file = element.file.replace(/^\/|\/$/g, '') // remove first and last slash
          const absPath = (path === '/' ? '' : path) + '/' + file
          ret[absPath.indexOf('/') === 0 ? absPath.substr(1, absPath.length) : absPath] = { isDirectory: element.isDirectory }
          // ^ ret does not accept path starting with '/'
        }
      }
      if (cb) cb(null, ret)
      return ret
    } catch (error) {
      if (cb) cb(error, null)
    }
  }

  /**
   * copy the folder recursively (internal use)
   * @param {string} path is the folder to be copied over
   * @param {Function} visitFile is a function called for each visited files
   * @param {Function} visitFolder is a function called for each visited folders
   */
  async _copyFolderToJsonInternal (path, visitFile, visitFolder) {
    visitFile = visitFile || function () { /* do nothing. */ }
    visitFolder = visitFolder || function () { /* do nothing. */ }

    const json = {}
    path = this.removePrefix(path)
    if (await window.remixFileSystem.exists(path)) {
      try {
        const items = await window.remixFileSystem.readdir(path)
        visitFolder({ path })
        if (items.length !== 0) {
          for (const item of items) {
            const file: any = {}
            const curPath = `${path}${path.endsWith('/') ? '' : '/'}${item.file}`
            if (item.isDirectory) {
              file.children = await this._copyFolderToJsonInternal(curPath, visitFile, visitFolder)
            } else {
              file.content = await window.remixFileSystem.readFile(curPath, 'utf8')
              visitFile({ path: curPath, content: file.content })
            }
            json[curPath] = file
          }
        }
      } catch (e) {
        console.log(e)
        throw new Error(e)
      }
    }
    console.log('json', json)
    return json
  }

  /**
 * Removes the folder recursively
 * @param {*} path is the folder to be removed
 */
  async remove(path: string) {
    try {
      await window.remixFileSystem.rmdir(path)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

}