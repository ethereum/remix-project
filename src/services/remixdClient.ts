import { PluginClient } from '@remixproject/plugin'
import { SharedFolderArgs, TrackDownStreamUpdate, WS } from '../../types'
import * as utils from '../utils'

const isbinaryfile = require('isbinaryfile')
const fs = require('fs-extra')

export class RemixdClient extends PluginClient {
  methods: ['folderIsReadOnly', 'resolveDirectory', 'get', 'exists', 'isFile']
  trackDownStreamUpdate: TrackDownStreamUpdate
  websocket: WS
  currentSharedFolder: string
  readOnly: boolean

  setWebSocket (websocket: WS) {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string, readOnly: boolean) {
    this.currentSharedFolder = currentSharedFolder
    this.readOnly = readOnly
  }

  list (args: SharedFolderArgs, cb: Function) {
    try {
      cb(null, utils.walkSync(this.currentSharedFolder, {}, this.currentSharedFolder))
    } catch (e) {
      cb(e.message)
    }
  }

  resolveDirectory (args: SharedFolderArgs) {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)
      const result = utils.resolveDirectory(path, this.currentSharedFolder)

      return result
    } catch (e) {
      throw new Error(e)
    }
  }

  folderIsReadOnly () {
    return this.readOnly
  }

  get (args: SharedFolderArgs) {
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
  }

  exists (args: SharedFolderArgs) {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)

      return fs.existsSync(path)
    } catch(error) {
      throw new Error(error)
    }
  }

  set (args: SharedFolderArgs, cb: Function) {
    if (this.readOnly) return cb('Cannot write file: read-only mode selected')
    const isFolder = args.path.endsWith('/')
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    if (fs.existsSync(path) && !isRealPath(path)) return
    if (args.content === 'undefined') { // no !!!!!
      console.log('trying to write "undefined" ! stopping.')
      return
    }
    this.trackDownStreamUpdate[path] = path
    if (isFolder) {
      fs.mkdirp(path).then(() => cb()).catch((e: Error) => cb(e))
    } else {
      fs.ensureFile(path).then(() => {
        fs.writeFile(path, args.content, 'utf8', (error: Error, data: string) => {
          if (error) console.log(error)
          cb(error, data)
        })
      }).catch((e: Error) => cb(e))
    }
  }

  rename (args: SharedFolderArgs, cb: Function) {
    if (this.readOnly) return cb('Cannot rename file: read-only mode selected')
    const oldpath = utils.absolutePath(args.oldPath, this.currentSharedFolder)

    if (!fs.existsSync(oldpath)) {
      return cb('File not found ' + oldpath)
    }
    const newpath = utils.absolutePath(args.newPath, this.currentSharedFolder)

    if (!isRealPath(oldpath)) return
    fs.move(oldpath, newpath, (error: Error, data: string) => {
      if (error) console.log(error)
      cb(error, data)
    })
  }

  remove (args: SharedFolderArgs, cb: Function) {
    if (this.readOnly) return cb('Cannot remove file: read-only mode selected')
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    if (!fs.existsSync(path)) {
      return cb('File not found ' + path)
    }
    if (!isRealPath(path)) return
    fs.remove(path, (error: Error) => {
      if (error) {
        console.log(error)
        return cb('Failed to remove file/directory: ' + error)
      }
      cb(error, true)
    })
  }

  isDirectory (args: SharedFolderArgs, cb: Function) {
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    cb(null, fs.statSync(path).isDirectory())
  }

  isFile (args: SharedFolderArgs) {
    try {
      const path = utils.absolutePath(args.path, this.currentSharedFolder)

      return fs.statSync(path).isFile()
    } catch (error) {
      throw new Error(error)
    }
  }
}

function isRealPath (path: string) {
  const realPath = fs.realpathSync(path)
  const isRealPath = path === realPath
  const mes = '[WARN] Symbolic link modification not allowed : ' + path + ' | ' + realPath

  if (!isRealPath) {
    console.log('\x1b[33m%s\x1b[0m', mes)
    throw new Error(mes)
  }
  return isRealPath
}