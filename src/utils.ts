import { ResolveDirectory } from '../types'

const fs = require('fs-extra')
const path = require('path')
const isbinaryfile = require('isbinaryfile')
const pathModule = require('path')

/**
 * returns the absolute path of the given @arg path
 *
 * @param {String} path - relative path (Unix style which is the one used by Remix IDE)
 * @param {String} sharedFolder - absolute shared path. platform dependent representation.
 * @return {String} platform dependent absolute path (/home/user1/.../... for unix, c:\user\...\... for windows)
 */
function absolutePath (path: string, sharedFolder:string) {
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
function relativePath (path: string, sharedFolder: string): string {
  const relative = <string>pathModule.relative(sharedFolder, path)
  return normalizePath(relative)
}

function normalizePath (path: string): string {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/')
  }
  return path
}

function walkSync (dir: string, filelist: {
  [key: string]: string
}, sharedFolder: string) {
  const files: string[] = fs.readdirSync(dir)

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

function resolveDirectory (dir: string, sharedFolder: string): ResolveDirectory {
  const ret: ResolveDirectory = {}
  const files: string[] = fs.readdirSync(dir)

  files.forEach(function (file) {
    const subElement = path.join(dir, file)
    if (!fs.lstatSync(subElement).isSymbolicLink()) {
      const relative: string = relativePath(subElement, sharedFolder)
      ret[relative] = { isDirectory: <boolean>fs.statSync(subElement).isDirectory() }
    }
  })
  return ret
}

export { absolutePath, relativePath, walkSync, resolveDirectory }
