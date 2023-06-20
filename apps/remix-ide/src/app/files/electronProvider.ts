const FileProvider = require('./fileProvider')

declare global {
  interface Window {
    remixFileSystem: any
  }
}

export class ElectronProvider extends FileProvider {
  constructor () {
    super('')
  }

  // isDirectory is already included
  // this is a more efficient version of the default implementation
  async resolveDirectory (path, cb) {
    path = this.removePrefix(path)
    if (path.indexOf('/') !== 0) path = '/' + path
    try {
      const files = await window.remixFileSystem.readdir(path)
      console.log(files, 'files resolveDirectory ELECTRON')
      const ret = {}
      if (files) {
        for (let element of files) {
          path = path.replace(/^\/|\/$/g, '') // remove first and last slash
          const file = element.file.replace(/^\/|\/$/g, '') // remove first and last slash
          const absPath = (path === '/' ? '' : path) + '/' + file
          ret[absPath.indexOf('/') === 0 ? absPath.substr(1, absPath.length) : absPath] = { isDirectory: element.isDirectory }
          // ^ ret does not accept path starting with '/'
        }
      }
      //console.log(ret, 'ret resolveDirectory ELECTRON')
      if (cb) cb(null, ret)
      return ret
    } catch (error) {
      if (cb) cb(error, null)
    }
  }

}