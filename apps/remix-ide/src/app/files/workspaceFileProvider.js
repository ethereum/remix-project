'use strict'

const FileProvider = require('./fileProvider')

class WorkspaceFileProvider extends FileProvider {
  constructor () {
    super('')
    this.workspacesPath = '.workspaces'
    this.workspace = null
  }

  setWorkspace (workspace) {
    workspace = workspace.replace(/^\/|\/$/g, '') // remove first and last slash
    this.workspace = workspace
  }

  getWorkspace () {
    return this.workspace
  }

  isReady () {
    return this.workspace !== null
  }

  clearWorkspace () {
    this.workspace = null
  }

  removePrefix (path) {
    if (!this.workspace) throw new Error('No workspace has been opened.')
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash
    if (path.startsWith(this.workspacesPath + '/' + this.workspace)) return path
    if (path.startsWith(this.workspace)) return this.workspacesPath + '/' + this.workspace
    path = super.removePrefix(path)
    const ret = this.workspacesPath + '/' + this.workspace + '/' + (path === '/' ? '' : path)
    return ret.replace(/^\/|\/$/g, '')
  }

  resolveDirectory (path, callback) {
    if (!this.workspace) throw new Error('No workspace has been opened.')
    super.resolveDirectory(path, (error, files) => {
      if (error) return callback(error)
      const unscoped = {}
      for (const file in files) {
        unscoped[file.replace(this.workspacesPath + '/' + this.workspace + '/', '')] = files[file]
      }
      callback(null, unscoped)
    })
  }

  async copyFolderToJson (directory, visitFile) {
    visitFile = visitFile || (() => {})
    const regex = new RegExp(`.workspaces/${this.workspace}/`, 'g')
    let json = await super._copyFolderToJsonInternal(directory, ({ path, content }) => {
      visitFile({ path: path.replace(regex, ''), content })
    })
    json = JSON.stringify(json).replace(regex, '')
    return JSON.parse(json)
  }

  _normalizePath (path) {
    if (!this.workspace) throw new Error('No workspace has been opened.')
    return path.replace(this.workspacesPath + '/' + this.workspace + '/', '')
  }
}

module.exports = WorkspaceFileProvider
