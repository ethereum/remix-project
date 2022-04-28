// Extend fs
import path from 'path'
const fs: any = require('fs') // eslint-disable-line

// https://github.com/mikeal/node-utils/blob/master/file/lib/main.js
fs.walkSync = function (start: string, callback) {
  fs.readdirSync(start).forEach((name: string) => {
    if (name === 'node_modules') {
      return // hack
    }
    const abspath = path.join(start, name)
    if (fs.statSync(abspath).isDirectory()) {
      fs.walkSync(abspath, callback)
    } else {
      callback(abspath)
    }
  })
}

export = fs
