var utils = require('../utils')
var isbinaryfile = require('isbinaryfile')
var fs = require('fs-extra')
var watch = require('watch')

module.exports = {
  monitors: [],
  trackDownStreamUpdate: {},

  sharedFolder: function (sharedFolder) {
    this.sharedFolder = sharedFolder
  },

  list: function (args, cb) {
    try {
      cb(null, utils.walkSync(this.sharedFolder, {}, this.sharedFolder))
    } catch (e) {
      cb(e.message)
    }
  },

  resolveDirectory: function (args, cb) {
    try {
      var path = utils.absolutePath(args.path, this.sharedFolder)
      cb(null, utils.resolveDirectory(path, this.sharedFolder))
    } catch (e) {
      cb(e.message)
    }
  },

  get: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    if (!fs.existsSync(path)) {
      return cb('File not found ' + path)
    }
    if (!isRealPath(path, cb)) return
    isbinaryfile(path, (error, isBinary) => {
      if (error) console.log(error)
      if (isBinary) {
        cb(null, '<binary content not displayed>')
      } else {
        fs.readFile(path, 'utf8', (error, data) => {
          if (error) console.log(error)
          cb(error, {content: data, readonly: false})
        })
      }
    })
  },

  exists: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    cb(null, fs.existsSync(path))
  },

  set: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    if (fs.existsSync(path) && !isRealPath(path, cb)) return
    this.trackDownStreamUpdate[path] = path
    fs.writeFile(path, args.content, 'utf8', (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  rename: function (args, cb) {
    var oldpath = utils.absolutePath(args.oldPath, this.sharedFolder)
    if (!fs.existsSync(oldpath)) {
      return cb('File not found ' + oldpath)
    }
    var newpath = utils.absolutePath(args.newPath, this.sharedFolder)
    if (!isRealPath(oldpath, cb)) return
    fs.move(oldpath, newpath, (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  remove: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    if (!fs.existsSync(path)) {
      return cb('File not found ' + path)
    }
    if (!isRealPath(path, cb)) return
    fs.remove(path, (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  setupNotifications: function (websocket, path) {
    if (!isRealPath(path)) return
    watch.createMonitor(path, (monitor) => {
      this.monitors.push(monitor)
      monitor.on('created', (f, stat) => {
        isbinaryfile(f, (error, isBinary) => {
          if (error) console.log(error)
          if (stat.isDirectory()) {
            this.setupNotifications(websocket, f)
          }
          if (websocket.connection) websocket.send(message('created', { path: utils.relativePath(f, this.sharedFolder), isReadOnly: isBinary, isFolder: stat.isDirectory() }))
        })
      })
      monitor.on('changed', (f, curr, prev) => {
        if (this.trackDownStreamUpdate[f]) {
          delete this.trackDownStreamUpdate[f]
          return
        }
        if (websocket.connection) websocket.send(message('changed', utils.relativePath(f, this.sharedFolder)))
      })
      monitor.on('removed', (f, stat) => {
        if (websocket.connection) websocket.send(message('removed', { path: utils.relativePath(f, this.sharedFolder), isFolder: stat.isDirectory() }))
      })
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
  return JSON.stringify({type: 'notification', scope: 'sharedfolder', name: name, value: value})
}
