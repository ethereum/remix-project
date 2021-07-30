import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import { checkSpecialChars, checkSlash } from '../../../../../../apps/remix-ide/src/lib/helper'

// const GistHandler = require('../../../../../../apps/remix-ide/src/lib/gist-handler')
const QueryParams = require('../../../../../../apps/remix-ide/src/lib/query-params')
const examples = require('../../../../../../apps/remix-ide/src/app/editor/examples')
let plugin

const setCurrentWorkspace = (workspace: string) => {
  return {
    type: 'SET_CURRENT_WORKSPACE',
    payload: workspace
  }
}

const setWorkspaces = (workspaces: string[]) => {
  return {
    type: 'SET_WORKSPACES',
    payload: workspaces
  }
}

const createWorkspaceTemplate = async (workspaceName: string, setDefaults = true, template: 'gist-template' | 'code-template' | 'default-template' = 'default-template') => {
  if (!workspaceName) throw new Error('workspace name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName)) throw new Error('workspace already exists')
  else {
    const workspaceProvider = plugin.fileProviders.workspace

    await workspaceProvider.createWorkspace(workspaceName)
    if (setDefaults) {
      switch (template) {
        case 'code-template':
          // creates a new workspace code-sample and loads code from url params.
          try {
            const queryParams = new QueryParams()
            const params = queryParams.get()
            await plugin.fileProviders.worspace.createWorkspace(workspaceName)
            const hash = bufferToHex(keccakFromString(params.code))
            const fileName = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
            const path = fileName

            await plugin.fileProviders.workspace.set(path, atob(params.code))
            await plugin.fileManager.openFile(fileName)
          } catch (e) {
            console.error(e)
          }
          break
        case 'gist-template':
          // creates a new workspace gist-sample and get the file from gist
          break
        case 'default-template':
          // creates a new workspace and populates it with default project template.
          // insert example contracts
          for (const file in examples) {
            try {
              await workspaceProvider.set(examples[file].name, examples[file].content)
            } catch (error) {
              console.error(error)
            }
          }
          break
      }
    }
  }
}

const workspaceExists = async (name: string) => {
  const workspaceProvider = plugin.fileProviders.workspace
  const browserProvider = plugin.fileProviders.browser
  const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name

  return browserProvider.exists(workspacePath)
}

export const initWorkspace = (filePanelPlugin) => async (dispatch: React.Dispatch<any>) => {
  plugin = filePanelPlugin
  const queryParams = new QueryParams()
  // const gistHandler = new GistHandler()
  const params = queryParams.get()
  // let loadedFromGist = false
  const workspaces = await getWorkspaces() || []

  dispatch(setWorkspaces(workspaces))
  // if (params.gist) {
  //   initialWorkspace = 'gist-sample'
  //   await filePanelPlugin.fileProviders.workspace.createWorkspace(initialWorkspace)
  //   loadedFromGist = gistHandler.loadFromGist(params, plugin.fileManager)
  // }
  // if (loadedFromGist) {
  //   dispatch(setWorkspaces(workspaces))
  //   dispatch(setCurrentWorkspace(initialWorkspace))
  //   return
  // }

  if (params.gist) {

  } else if (params.code) {
    await createWorkspaceTemplate('code-sample', true, 'code-template')
    dispatch(setCurrentWorkspace('code-sample'))
  } else {
    if (workspaces.length === 0) {
      await createWorkspaceTemplate('default_workspace')
      dispatch(setCurrentWorkspace('default_workspace'))
    } else {
      if (workspaces.length > 0) {
        plugin.fileProviders.workspace.setWorkspace(workspaces[workspaces.length - 1])
        dispatch(setCurrentWorkspace(workspaces[workspaces.length - 1]))
      }
    }
  }

  // plugin.fileProviders.localhost.event.off('disconnected', localhostDisconnect)
  // plugin.fileProviders.localhost.event.on('disconnected', localhostDisconnect)
  // plugin.fileProviders.localhost.event.on('connected', () => {
  //   remixdExplorer.show()
  //   setWorkspace(LOCALHOST)
  // })

  // plugin.fileProviders.localhost.event.on('disconnected', () => {
  //   remixdExplorer.hide()
  // })

  // plugin.fileProviders.localhost.event.on('loading', () => {
  //   remixdExplorer.loading()
  // })

  // plugin.fileProviders.workspace.event.on('createWorkspace', (name) => {
  //   createNewWorkspace(name)
  // })
}

const getWorkspaces = async (): Promise<string[]> | undefined => {
  try {
    const workspaces: string[] = await new Promise((resolve, reject) => {
      const workspacesPath = plugin.fileProviders.workspace.workspacesPath

      plugin.fileProviders.browser.resolveDirectory('/' + workspacesPath, (error, items) => {
        if (error) {
          console.error(error)
          return reject(error)
        }
        resolve(Object.keys(items)
          .filter((item) => items[item].isDirectory)
          .map((folder) => folder.replace(workspacesPath + '/', '')))
      })
    })

    return workspaces
  } catch (e) {
    // modalDialogCustom.alert('Workspaces have not been created on your system. Please use "Migrate old filesystem to workspace" on the home page to transfer your files or start by creating a new workspace in the File Explorers.')
    console.log(e)
  }
}
