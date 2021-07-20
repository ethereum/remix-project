import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import { checkSpecialChars, checkSlash } from '../../../../../../apps/remix-ide/src/lib/helper'

const GistHandler = require('../../../../../../apps/remix-ide/src/lib/gist-handler')
const QueryParams = require('../../../../../../apps/remix-ide/src/lib/query-params')
const examples = require('../../../../../../apps/remix-ide/src/app/editor/examples')
let plugin

export const setCurrentWorkspace = (workspace: string) => {
  return {
    type: 'SET_CURRENT_WORKSPACE',
    payload: workspace
  }
}

export const initWorkspace = (filePanelPlugin) => async (dispatch: React.Dispatch<any>) => {
  plugin = filePanelPlugin
  const queryParams = new QueryParams()
  const gistHandler = new GistHandler()
  const params = queryParams.get()
  // get the file from gist
  let loadedFromGist = false

  if (params.gist) {
    await processCreateWorkspace('gist-sample')
    plugin.initialWorkspace = 'gist-sample'
    loadedFromGist = gistHandler.loadFromGist(params, plugin.fileManager)
  }
  if (loadedFromGist) return

  if (params.code) {
    try {
      await processCreateWorkspace('code-sample')
      const hash = bufferToHex(keccakFromString(params.code))
      const fileName = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
      const path = fileName

      await plugin.fileProviders.workspace.set(path, atob(params.code))
      plugin.initialWorkspace = 'code-sample'
      await plugin.fileManager.openFile(fileName)
    } catch (e) {
      console.error(e)
    }
    return
  }

  return new Promise((resolve, reject) => {
    plugin.fileProviders.browser.resolveDirectory('/', async (error, filesList) => {
      if (error) return reject(error)
      if (Object.keys(filesList).length === 0) {
        await createWorkspace('default_workspace')
        return resolve('default_workspace')
      } else {
        plugin.fileProviders.browser.resolveDirectory('.workspaces', async (error, filesList) => {
          if (error) return reject(error)
          if (Object.keys(filesList).length > 0) {
            const workspacePath = Object.keys(filesList)[0].split('/').filter(val => val)
            const workspaceName = workspacePath[workspacePath.length - 1]

            plugin.fileProviders.workspace.setWorkspace(workspaceName)
            return resolve(workspaceName)
          }
          return reject(new Error('Can\'t find available workspace.'))
        })
      }
    })
  })
}

const processCreateWorkspace = async (name: string) => {
  const workspaceProvider = plugin.fileProviders.workspace
  const browserProvider = plugin.fileProviders.browser
  const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name
  const workspaceRootPath = 'browser/' + workspaceProvider.workspacesPath
  const workspaceRootPathExists = await browserProvider.exists(workspaceRootPath)
  const workspacePathExists = await browserProvider.exists(workspacePath)

  if (!workspaceRootPathExists) browserProvider.createDir(workspaceRootPath)
  if (!workspacePathExists) browserProvider.createDir(workspacePath)
  plugin.fileProviders.workspace.setWorkspace(name)
}

const createWorkspace = async (workspaceName, setDefaults = true) => {
  if (!workspaceName) throw new Error('name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName)) throw new Error('workspace already exists')
  else {
    const workspaceProvider = plugin.fileProviders.workspace

    await processCreateWorkspace(workspaceName)
    workspaceProvider.setWorkspace(workspaceName)
    plugin.workspaceName = workspaceName
    if (setDefaults) {
      // insert example contracts if there are no files to show
      for (const file in examples) {
        try {
          await workspaceProvider.set(examples[file].name, examples[file].content)
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
}

const workspaceExists = async (name) => {
  const workspaceProvider = plugin.fileProviders.workspace
  const browserProvider = plugin.fileProviders.browser
  const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name

  return browserProvider.exists(workspacePath)
}
