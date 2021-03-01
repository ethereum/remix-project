'use strict'

const FileProvider = require('./fileProvider')

class WorkspaceFileProvider extends FileProvider {
  constructor () {
    super('')
    this.workspacesPath = '.workspaces'
  }

  setWorkspace (workspace) {
    workspace = workspace.replace(/^\/|\/$/g, '') // remove first and last slash
    this.workspace = workspace
  }

  clearWorkspace () {
    this.workspace = null
  }

  removePrefix (path) {
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash
    if (path.startsWith(this.workspacesPath + '/' + this.workspace)) return path
    if (path.startsWith(this.workspace)) return this.workspacesPath + '/' + this.workspace
    path = super.removePrefix(path)
    const ret = this.workspacesPath + '/' + this.workspace + '/' + (path === '/' ? '' : path)
    return ret.replace(/^\/|\/$/g, '')
  }

  resolveDirectory (path, callback) {
    super.resolveDirectory(path, (error, files) => {
      if (error) return callback(error)
      const unscoped = {}
      for (const file in files) {
        unscoped[file.replace(this.workspacesPath + '/' + this.workspace + '/', '')] = files[file]
      }
      callback(null, unscoped)
    })
  }

  _normalizePath (path) {
    return path.replace(this.workspacesPath + '/' + this.workspace + '/', '')
  }
}

module.exports = WorkspaceFileProvider
