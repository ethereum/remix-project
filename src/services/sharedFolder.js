var utils = require('../utils')
var isbinaryfile = require('isbinaryfile')
var fs = require('fs-extra')
var chokidar = require('chokidar')
const { PluginClient } = require('@remixproject/plugin')

class SharedFolder extends PluginClient {
  trackDownStreamUpdate = {}
  websocket = null
  alreadyNotified = {}

  setWebSocket (websocket) {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder, readOnly) {
    this.currentSharedFolder = currentSharedFolder
    this.readOnly = readOnly
    if (this.websocket.connection) this.websocket.send(message('rootFolderChanged', {}))
  }

  list (args, cb) {
    try {
      cb(null, utils.walkSync(this.currentSharedFolder, {}, this.currentSharedFolder))
    } catch (e) {
      cb(e.message)
    }
  }

  resolveDirectory (args, cb) {
    try {
      var path = utils.absolutePath(args.path, this.currentSharedFolder)
      if (this.websocket && !this.alreadyNotified[path]) {
        this.alreadyNotified[path] = 1
        this.setupNotifications(path)
      }
      cb(null, utils.resolveDirectory(path, this.currentSharedFolder))
    } catch (e) {
      cb(e.message)
    }
  }

  folderIsReadOnly (args, cb) {
    return cb(null, this.readOnly)
  }

  get (args, cb) {
    var path = utils.absolutePath(args.path, this.currentSharedFolder)
    if (!fs.existsSync(path)) {
      return cb('File not found ' + path)
    }
    if (!isRealPath(path, cb)) return
    isbinaryfile(path, (error, isBinary) => {
      if (error) console.log(error)
      if (isBinary) {
        cb(null, { content: '<binary content not displayed>', readonly: true })
      } else {
        fs.readFile(path, 'utf8', (error, data) => {
          if (error) console.log(error)
          cb(error, { content: data, readonly: false })
        })
      }
    })
  }

  exists (args, cb) {
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    cb(null, fs.existsSync(path))
  }

  set (args, cb) {
    if (this.readOnly) return cb('Cannot write file: read-only mode selected')
    const isFolder = args.path.endsWith('/')
    var path = utils.absolutePath(args.path, this.currentSharedFolder)
    if (fs.existsSync(path) && !isRealPath(path, cb)) return
    if (args.content === 'undefined') { // no !!!!!
      console.log('trying to write "undefined" ! stopping.')
      return
    }
    this.trackDownStreamUpdate[path] = path
    if (isFolder) {
      fs.mkdirp(path).then(_ => cb()).catch(e => cb(e))
    } else {
      fs.ensureFile(path).then(() => {
        fs.writeFile(path, args.content, 'utf8', (error, data) => {
          if (error) console.log(error)
          cb(error, data)
        })
      }).catch(e => cb(e))
    }
  }

  rename (args, cb) {
    if (this.readOnly) return cb('Cannot rename file: read-only mode selected')
    var oldpath = utils.absolutePath(args.oldPath, this.currentSharedFolder)
    if (!fs.existsSync(oldpath)) {
      return cb('File not found ' + oldpath)
    }
    var newpath = utils.absolutePath(args.newPath, this.currentSharedFolder)
    if (!isRealPath(oldpath, cb)) return
    fs.move(oldpath, newpath, (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  }

  remove (args, cb) {
    if (this.readOnly) return cb('Cannot remove file: read-only mode selected')
    var path = utils.absolutePath(args.path, this.currentSharedFolder)
    if (!fs.existsSync(path)) {
      return cb('File not found ' + path)
    }
    if (!isRealPath(path, cb)) return
    fs.remove(path, (error) => {
      if (error) {
        console.log(error)
        return cb('Failed to remove file/directory: ' + error)
      }
      cb(error, true)
    })
  }

  isDirectory (args, cb) {
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    cb(null, fs.statSync(path).isDirectory())
  }

  isFile (args, cb) {
    const path = utils.absolutePath(args.path, this.currentSharedFolder)

    cb(null, fs.statSync(path).isFile())
  }

  setupNotifications (path) {
    if (!isRealPath(path)) return
    var watcher = chokidar.watch(path, { depth: 0, ignorePermissionErrors: true })
    console.log('setup notifications for ' + path)
    watcher.on('change', (f, curr, prev) => {
      if (this.trackDownStreamUpdate[f]) {
        delete this.trackDownStreamUpdate[f]
        return
      }
      if (this.websocket.connection) this.websocket.send(message('changed', utils.relativePath(f, this.currentSharedFolder)))
    })
    watcher.on('unlink', (f) => {
      if (this.websocket.connection) this.websocket.send(message('removed', { path: utils.relativePath(f, this.currentSharedFolder), isFolder: false }))
    })
    watcher.on('unlinkDir', (f) => {
      if (this.websocket.connection) this.websocket.send(message('removed', { path: utils.relativePath(f, this.currentSharedFolder), isFolder: true }))
    })
  }

}

function isRealPath (path, cb) {
  var realPath = fs.realpathSync(path)
  var isRealPath = path === realPath
  var mes = '[WARN] Symbolic link modification not allowed : ' + path + ' | ' + realPath
  if (!isRealPath) {
    console.log('\x1b[33m%s\x1b[0m', mes)
  }
  if (cb && !isRealPath) cb(mes)
  return isRealPath
}

function message (name, value) {
  return JSON.stringify({ type: 'notification', scope: 'sharedfolder', name: name, value: value })
}

module.exports = SharedFolder
