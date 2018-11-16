// Extend fs
var fs = require('fs')
const path = require('path')

// https://github.com/mikeal/node-utils/blob/master/file/lib/main.js
fs.walkSync = function (start, callback) {
  fs.readdirSync(start).forEach(name => {
    if (name === 'node_modules') {
      return // hack
    }
    var abspath = path.join(start, name)
    if (fs.statSync(abspath).isDirectory()) {
      fs.walkSync(abspath, callback)
    } else {
      callback(abspath)
    }
  })
}

module.exports = fs
