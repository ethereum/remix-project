var fs = require('fs-extra')
var path = require('path')
var isbinaryfile = require('isbinaryfile')
var pathModule = require('path')

module.exports = {
  absolutePath: absolutePath,
  relativePath: relativePath,
  walkSync: walkSync,
  resolveDirectory: resolveDirectory
}

/**
 * returns the absolute path of the given @arg path
 *
 * @param {String} path - relative path (Unix style which is the one used by Remix IDE)
 * @param {String} sharedFolder - absolute shared path. platform dependent representation.
 * @return {String} platform dependent absolute path (/home/user1/.../... for unix, c:\user\...\... for windows)
 */
function absolutePath (path, sharedFolder) {
  path = normalizePath(path)
  if (path.indexOf(sharedFolder) !== 0) {
    path = pathModule.resolve(sharedFolder, path)
  }
  return path
}

/**
 * return the relative path of the given @arg path
 *
 * @param {String} path - absolute platform dependent path
 * @param {String} sharedFolder - absolute shared path. platform dependent representation
 * @return {String} relative path (Unix style which is the one used by Remix IDE)
 */
function relativePath (path, sharedFolder) {
  var relative = pathModule.relative(sharedFolder, path)
  return normalizePath(relative)
}

function normalizePath (path) {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/')
  }
  return path
}

function walkSync (dir, filelist, sharedFolder) {
  var files = fs.readdirSync(dir)
  filelist = filelist || {}
  files.forEach(function (file) {
    var subElement = path.join(dir, file)
    if (!fs.lstatSync(subElement).isSymbolicLink()) {
      if (fs.statSync(subElement).isDirectory()) {
        filelist = walkSync(subElement, filelist, sharedFolder)
      } else {
        var relative = relativePath(subElement, sharedFolder)
        filelist[relative] = isbinaryfile.sync(subElement)
      }
    }
  })
  return filelist
}

function resolveDirectory (dir, sharedFolder) {
  var ret = {}
  var files = fs.readdirSync(dir)
  files.forEach(function (file) {
    var subElement = path.join(dir, file)
    if (!fs.lstatSync(subElement).isSymbolicLink()) {
      var relative = relativePath(subElement, sharedFolder)
      ret[relative] = { isDirectory: fs.statSync(subElement).isDirectory() }
    }
  })
  return ret
}
