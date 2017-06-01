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
    cb(null, utils.walkSync(this.sharedFolder, {}, this.sharedFolder))
  },

  get: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    isbinaryfile(path, (error, isBinary) => {
      if (error) console.log(error)
      if (isBinary) {
        cb(null, '<binary content not displayed>')
      } else {
        fs.readFile(path, 'utf8', (error, data) => {
          if (error) console.log(error)
          cb(error, data)
        })
      }
    })
  },

  set: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    this.trackDownStreamUpdate[path] = path
    fs.writeFile(path, args.content, 'utf8', (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  rename: function (args, cb) {
    var oldpath = utils.absolutePath(args.oldPath, this.sharedFolder)
    var newpath = utils.absolutePath(args.newPath, this.sharedFolder)
    fs.move(oldpath, newpath, (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  remove: function (args, cb) {
    var path = utils.absolutePath(args.path, this.sharedFolder)
    fs.remove(path, (error, data) => {
      if (error) console.log(error)
      cb(error, data)
    })
  },

  setupNotifications: function (websocket, path) {
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

function message (name, value) {
  return JSON.stringify({type: 'notification', scope: 'sharedfolder', name: name, value: value})
}
