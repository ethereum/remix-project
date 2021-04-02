import { Storage } from '@remix-project/remix-lib'
import { joinPath } from './lib/helper'
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
/*
  Migrating the files to the BrowserFS storage instead or raw localstorage
*/
export default (fileProvider) => {
  const fileStorage = new Storage('sol:')
  const flag = 'status'
  const fileStorageBrowserFS = new Storage('remix_browserFS_migration:')
  if (fileStorageBrowserFS.get(flag) === 'done') return
  fileStorage.keys().forEach((path) => {
    if (path !== '.remix.config') {
      const content = fileStorage.get(path)
      fileProvider.set(path, content)
      // TODO https://github.com/ethereum/remix-ide/issues/2377
      // fileStorage.remove(path) we don't want to remove it as we are still supporting the old version
    }
  })
  fileStorageBrowserFS.set(flag, 'done')
}

export async function migrateToWorkspace (fileManager, filePanel) {
  const browserProvider = fileManager.getProvider('browser')
  const workspaceProvider = fileManager.getProvider('workspace')
  const files = await browserProvider.copyFolderToJson('/')

  if (Object.keys(files).length === 0) {
    // we don't have any root file, only .workspaces
    // don't need to create a workspace
    throw new Error('No file to migrate')
  }

  if (Object.keys(files).length === 1 && files['/.workspaces']) {
    // we don't have any root file, only .workspaces
    // don't need to create a workspace
    throw new Error('No file to migrate')
  }

  const workspaceName = 'workspace_migrated_' + Date.now()
  await filePanel.processCreateWorkspace(workspaceName)
  filePanel.getWorkspaces() // refresh list
  const workspacePath = joinPath('browser', workspaceProvider.workspacesPath, workspaceName)
  await populateWorkspace(workspacePath, files, browserProvider)
  return workspaceName
}

const populateWorkspace = async (workspace, json, browserProvider) => {
  for (const item in json) {
    const isFolder = json[item].content === undefined
    if (isFolder && item === '/.workspaces') continue // we don't want to replicate this one.
    if (isFolder) {
      browserProvider.createDir(joinPath(workspace, item))
      await populateWorkspace(workspace, json[item].children, browserProvider)
    } else {
      await browserProvider.set(joinPath(workspace, item), json[item].content, (err) => {
        if (err && err.message) {
          modalDialogCustom.alert(`There was an error migrating your files: ${err.message}`)
        }
      })
    }
  }
}
