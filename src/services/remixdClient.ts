import { PluginClient } from '@remixproject/plugin'
import { SharedFolderArgs, TrackDownStreamUpdate, WS, Filelist, ResolveDirectory, FileContent } from '../../types'
import * as utils from '../utils'

const isbinaryfile = require('isbinaryfile')
const fs = require('fs-extra')

export class RemixdClient extends PluginClient {
  methods: ['folderIsReadOnly', 'resolveDirectory', 'get', 'exists', 'isFile', 'set', 'list', 'isDirectory']
  trackDownStreamUpdate: TrackDownStreamUpdate = {}
  websocket: WS
  currentSharedFolder: string
  readOnly: boolean

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string, readOnly: boolean): void {
    this.currentSharedFolder = currentSharedFolder
    this.readOnly = readOnly
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
          reject('File not found ' + path)
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
    } catch(error) {
      throw new Error(error)
    }
  }

  set (args: SharedFolderArgs): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) reject('Cannot write file: read-only mode selected')
        const isFolder = args.path.endsWith('/')
        const path = utils.absolutePath(args.path, this.currentSharedFolder)
    
        if (fs.existsSync(path) && !isRealPath(path)) reject()
        if (args.content === 'undefined') { // no !!!!!
          console.log('trying to write "undefined" ! stopping.')
          reject('trying to write "undefined" ! stopping.')
        }
        this.trackDownStreamUpdate[path] = path
        if (isFolder) {
          fs.mkdirp(path).then(() => resolve()).catch((e: Error) => reject(e))
        } else {
          fs.ensureFile(path).then(() => {
            fs.writeFile(path, args.content, 'utf8', (error: Error) => {
              if (error) {
                console.log(error)
                reject(error)
              }
              resolve()
            })
          }).catch((e: Error) => reject(e))
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  rename (args: SharedFolderArgs): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        if (this.readOnly) reject('Cannot rename file: read-only mode selected')
        const oldpath = utils.absolutePath(args.oldPath, this.currentSharedFolder)
    
        if (!fs.existsSync(oldpath)) {
          reject('File not found ' + oldpath)
        }
        const newpath = utils.absolutePath(args.newPath, this.currentSharedFolder)
    
        if (!isRealPath(oldpath)) return
        fs.move(oldpath, newpath, (error: Error) => {
          if (error) {
            console.log(error)
            reject(error.message)
          }
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
        if (this.readOnly) reject('Cannot remove file: read-only mode selected')
        const path = utils.absolutePath(args.path, this.currentSharedFolder)
    
        if (!fs.existsSync(path)) reject('File not found ' + path)
        if (!isRealPath(path)) return
        return fs.remove(path, (error: Error) => {
          if (error) {
            console.log(error)
            reject('Failed to remove file/directory: ' + error)
          }
          resolve(true)
        })
      })
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
}

function isRealPath (path: string): boolean {
  const realPath = fs.realpathSync(path)
  const isRealPath = path === realPath
  const mes = '[WARN] Symbolic link modification not allowed : ' + path + ' | ' + realPath

  if (!isRealPath) {
    console.log('\x1b[33m%s\x1b[0m', mes)
    throw new Error(mes)
  }
  return isRealPath
}