'use strict'

const EventManager = require('../../lib/events')
const FileProvider = require('./fileProvider')
const pathModule = require('path')

class WorkspaceFileProvider extends FileProvider {
  constructor () {
    super('')
    this.workspacesPath = '.workspaces'
    this.workspace = null
    this.event = new EventManager()
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
    if (!this.workspace) this.createWorkspace()
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash
    if (path.startsWith(this.workspacesPath + '/' + this.workspace)) return path
    if (path.startsWith(this.workspace)) return path.replace(this.workspace, this.workspacesPath + '/' + this.workspace)
    path = super.removePrefix(path)
    let ret = this.workspacesPath + '/' + this.workspace + '/' + (path === '/' ? '' : path)

    ret = ret.replace(/^\/|\/$/g, '')
    if (!this.isSubDirectory(this.workspacesPath + '/' + this.workspace, ret)) throw new Error('Cannot read/write to path outside workspace')
    return ret
  }

  isSubDirectory (parent, child) {
    if (!parent) return false
    if (parent === child) return true
    const relative = pathModule.relative(parent, child)

    return !!relative && relative.split(pathModule.sep)[0] !== '..'
  }

  resolveDirectory (path, callback) {
    if (!this.workspace) this.createWorkspace()
    super.resolveDirectory(path, (error, files) => {
      if (error) return callback(error)
      const unscoped = {}
      for (const file in files) {
        unscoped[file.replace(this.workspacesPath + '/' + this.workspace + '/', '')] = files[file]
      }
      callback(null, unscoped)
    })
  }

  async copyFolderToJson (directory, visitFile, visitFolder) {
    visitFile = visitFile || (() => {})
    visitFolder = visitFolder || (() => {})
    const regex = new RegExp(`.workspaces/${this.workspace}/`, 'g')
    let json = await super._copyFolderToJsonInternal(directory, ({ path, content }) => {
      visitFile({ path: path.replace(regex, ''), content })
    }, ({ path }) => {
      visitFolder({ path: path.replace(regex, '') })
    })
    json = JSON.stringify(json).replace(regex, '')
    return JSON.parse(json)
  }

  _normalizePath (path) {
    if (!this.workspace) this.createWorkspace()
    return path.replace(this.workspacesPath + '/' + this.workspace + '/', '')
  }

  createWorkspace (name) {
    if (!name) name = 'default_workspace'
    this.event.trigger('createWorkspace', [name])
  }
}

module.exports = WorkspaceFileProvider
