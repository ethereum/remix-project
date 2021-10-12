import { PluginClient } from '@remixproject/plugin'
import { SharedFolderArgs, TrackDownStreamUpdate, Filelist, ResolveDirectory, FileContent } from '../types' // eslint-disable-line
import * as WS from 'ws' // eslint-disable-line
import * as utils from '../utils'
import * as chokidar from 'chokidar'
import * as fs from 'fs-extra'
import * as isbinaryfile from 'isbinaryfile'

export class RemixdClient extends PluginClient {
  methods: Array<string>
  trackDownStreamUpdate: TrackDownStreamUpdate = {}
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['folderIsReadOnly', 'resolveDirectory', 'get', 'exists', 'isFile', 'set', 'rename', 'remove', 'isDirectory', 'list', 'createDir', 'canDeactivate']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    if (this.isLoaded) this.emit('rootFolderChanged', this.currentSharedFolder)
  }

  list (): Filelist {
    try {
      return utils.walkSync(this.currentSharedFolder, {}, this.currentSharedFolder)
    } catch (e) {
      throw new Error(e)
    }
  }

  resolveDirectory (args: SharedFolderArgs): ResolveDirectory {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)
      const result = utils.resolveDirectory(path, this.currentSharedFolder)

      return result
    } catch (e) {
      throw new Error(e)
    }
  }

  folderIsReadOnly (): boolean {
    return this.readOnly
  }

  get (args: SharedFolderArgs): Promise<FileContent> {
    try {
      return new Promise((resolve, reject) => {
        const path = utils.absolutePath(args.path, this.currentSharedFolder)

        if (!fs.existsSync(path)) {
          return reject(new Error('File not found ' + path))
        }
        if (!isRealPath(path)) return
        isbinaryfile(path, (error: Error, isBinary: boolean) => {
          if (error) console.log(error)
          if (isBinary) {
            resolve({ content: '<binary content not displayed>', readonly: true })
          } else {
            fs.readFile(path, 'utf8', (error: Error, data: string) => {
              if (error) console.log(error)
              resolve({ content: data, readonly: false })
            })
          }
        })
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  exists (args: SharedFolderArgs): boolean {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)

      return fs.existsSync(path)
    } catch (error) {
      throw new Error(error)
    }
  }

  set (args: SharedFolderArgs) {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) return reject(new Error('Cannot write file: read-only mode selected'))
        const path = utils.absolutePath(args.path, this.currentSharedFolder)
        const exists = fs.existsSync(path)

        if (exists && !isRealPath(path)) return reject(new Error(''))
        if (args.content === 'undefined') { // no !!!!!
          console.log('trying to write "undefined" ! stopping.')
          return reject(new Error('trying to write "undefined" ! stopping.'))
        }
        this.trackDownStreamUpdate[path] = path
        if (!exists && args.path.indexOf('/') !== -1) {
          // the last element is the filename and we should remove it
          this.createDir({ path: args.path.substr(0, args.path.lastIndexOf('/')) })
        }
        try {
          fs.writeFile(path, args.content, 'utf8', (error: Error) => {
            if (error) {
              console.log(error)
              return reject(error)
            }
            resolve(true)
          })
        } catch (e) {
          return reject(e)
        }
        if (!exists) {
          this.emit('fileAdded', args.path)
        } else {
          this.emit('fileChanged', args.path)
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  createDir (args: SharedFolderArgs) {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) return reject(new Error('Cannot create folder: read-only mode selected'))
        const paths = args.path.split('/').filter(value => value)
        if (paths.length && paths[0] === '') paths.shift()
        let currentCheck = ''
        paths.forEach((value) => {
          currentCheck = currentCheck ? currentCheck + '/' + value : value
          const path = utils.absolutePath(currentCheck, this.currentSharedFolder)
          if (!fs.existsSync(path)) {
            fs.mkdirp(path)
            this.emit('folderAdded', currentCheck)
          }
        })
        resolve(true)
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  rename (args: SharedFolderArgs): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) return reject(new Error('Cannot rename file: read-only mode selected'))
        const oldpath = utils.absolutePath(args.oldPath, this.currentSharedFolder)

        if (!fs.existsSync(oldpath)) {
          return reject(new Error('File not found ' + oldpath))
        }
        const newpath = utils.absolutePath(args.newPath, this.currentSharedFolder)

        if (!isRealPath(oldpath)) return
        fs.move(oldpath, newpath, (error: Error) => {
          if (error) {
            console.log(error)
            return reject(error.message)
          }
          this.emit('fileRenamed', args.oldPath, args.newPath)
          resolve(true)
        })
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  remove (args: SharedFolderArgs): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) return reject(new Error('Cannot remove file: read-only mode selected'))
        const path = utils.absolutePath(args.path, this.currentSharedFolder)

        if (!fs.existsSync(path)) return reject(new Error('File not found ' + path))
        if (!isRealPath(path)) return
        // Saving the content of the item{folder} before removing it
        const ls = []
        try {
          const resolveList = (path) => {
            if (!this._isFile(path)) {
              const list = utils.resolveDirectory(path, this.currentSharedFolder)
              Object.keys(list).forEach(itemPath => {
                if (list[itemPath].isDirectory) {
                  resolveList(`${this.currentSharedFolder}/${itemPath}`)
                }
                ls.push(itemPath)
              })
            }
          }
          resolveList(path)
          ls.push(args.path)
        } catch (e) {
          throw new Error(e)
        }
        return fs.remove(path, (error: Error) => {
          if (error) {
            console.log(error)
            return reject(new Error('Failed to remove file/directory: ' + error))
          }
          for (const file in ls) {
            this.emit('fileRemoved', ls[file])
          }

          resolve(true)
        })
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  _isFile (path: string): boolean {
    try {
      return fs.statSync(path).isFile()
    } catch (error) {
      throw new Error(error)
    }
  }

  isDirectory (args: SharedFolderArgs): boolean {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)
      return fs.statSync(path).isDirectory()
    } catch (error) {
      throw new Error(error)
    }
  }

  isFile (args: SharedFolderArgs): boolean {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)
      return fs.statSync(path).isFile()
    } catch (error) {
      throw new Error(error)
    }
  }

  setupNotifications (path: string): void {
    const absPath = utils.absolutePath('./', path)

    if (!isRealPath(absPath)) return
    const watcher = chokidar.watch(path, { depth: 0, ignorePermissionErrors: true })
    console.log('setup notifications for ' + path)
    /* we can't listen on created file / folder
    watcher.on('add', (f, stat) => {
      isbinaryfile(f, (error, isBinary) => {
        if (error) console.log(error)
        console.log('add', f)
        this.emit('created', { path: utils.relativePath(f, this.currentSharedFolder), isReadOnly: isBinary, isFolder: false })
      })
    })
    watcher.on('addDir', (f, stat) => {
      this.emit('created', { path: utils.relativePath(f, this.currentSharedFolder), isReadOnly: false, isFolder: true })
    })
    */
    watcher.on('change', (f: string) => {
      if (this.trackDownStreamUpdate[f]) {
        delete this.trackDownStreamUpdate[f]
        return
      }
      this.emit('changed', utils.relativePath(f, this.currentSharedFolder))
    })
    watcher.on('unlink', (f: string) => {
      this.emit('removed', utils.relativePath(f, this.currentSharedFolder), false)
    })
    watcher.on('unlinkDir', (f: string) => {
      this.emit('removed', utils.relativePath(f, this.currentSharedFolder), true)
    })
  }
}

function isRealPath (path: string): boolean {
  const realPath = fs.realpathSync(path)
  const isRealPath = path === realPath
  const mes = '[WARN] Symbolic link modification not allowed : ' + path + ' | ' + realPath

  if (!isRealPath) {
    console.log('\x1b[33m%s\x1b[0m', mes)
    // throw new Error(mes)
  }
  return isRealPath
}
