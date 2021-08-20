import React from 'react'
import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import axios, { AxiosResponse } from 'axios'
import { checkSpecialChars, checkSlash } from '@remix-ui/helper'

const QueryParams = require('../../../../../../apps/remix-ide/src/lib/query-params')
const examples = require('../../../../../../apps/remix-ide/src/app/editor/examples')
const queuedEvents = []
const pendingEvents = {}

let plugin, dispatch: React.Dispatch<any>

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

const setMode = (mode: 'browser' | 'localhost') => {
  return {
    type: 'SET_MODE',
    payload: mode
  }
}

const fetchDirectoryError = (error: any) => {
  return {
    type: 'FETCH_DIRECTORY_ERROR',
    payload: error
  }
}

const fetchDirectoryRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_DIRECTORY_REQUEST',
    payload: promise
  }
}

const fetchDirectorySuccess = (path: string, files) => {
  return {
    type: 'FETCH_DIRECTORY_SUCCESS',
    payload: { path, files }
  }
}

const displayNotification = (title: string, message: string, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void) => {
  return {
    type: 'DISPLAY_NOTIFICATION',
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

const hideNotification = () => {
  return {
    type: 'HIDE_NOTIFICATION'
  }
}

const fileAddedSuccess = (filePath: string) => {
  return {
    type: 'FILE_ADDED_SUCCESS',
    payload: filePath
  }
}

const folderAddedSuccess = (folderPath: string) => {
  return {
    type: 'FOLDER_ADDED_SUCCESS',
    payload: folderPath
  }
}

const fileRemovedSuccess = (removePath: string) => {
  return {
    type: 'FILE_REMOVED_SUCCESS',
    payload: removePath
  }
}

const rootFolderChangedSuccess = (path: string) => {
  return {
    type: 'ROOT_FOLDER_CHANGED',
    payload: path
  }
}

const createWorkspaceTemplate = async (workspaceName: string, setDefaults = true, template: 'gist-template' | 'code-template' | 'default-template' = 'default-template') => {
  if (!workspaceName) throw new Error('workspace name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName) && template === 'default-template') throw new Error('workspace already exists')
  else {
    const workspaceProvider = plugin.fileProviders.workspace

    await workspaceProvider.createWorkspace(workspaceName)
    if (setDefaults) {
      const queryParams = new QueryParams()
      const params = queryParams.get()

      switch (template) {
        case 'code-template':
          // creates a new workspace code-sample and loads code from url params.
          try {
            await workspaceProvider.createWorkspace(workspaceName)
            let path = ''; let content = ''

            if (params.code) {
              const hash = bufferToHex(keccakFromString(params.code))

              path = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
              content = atob(params.code)
              await workspaceProvider.set(path, content)
            } else if (params.url) {
              const data = await plugin.call('contentImport', 'resolve', params.url)

              path = data.cleanUrl
              content = data.content
              await workspaceProvider.set(path, content)
            }
            await plugin.fileManager.openFile(path)
          } catch (e) {
            console.error(e)
          }
          break

        case 'gist-template':
          // creates a new workspace gist-sample and get the file from gist
          try {
            const gistId = params.gist
            const response: AxiosResponse = await axios.get(`https://api.github.com/gists/${gistId}`)
            const data = response.data

            if (!data.files) {
              return dispatch(displayNotification('Gist load error', 'No files found', 'OK', null, () => { dispatch(hideNotification()) }, null))
            }
            const obj = {}

            Object.keys(data.files).forEach((element) => {
              const path = element.replace(/\.\.\./g, '/')

              obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
            })
            plugin.fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
              if (!errorLoadingFile) {
                const provider = plugin.fileManager.getProvider('workspace')

                provider.lastLoadedGistId = gistId
              } else {
                displayNotification('', errorLoadingFile.message || errorLoadingFile, 'OK', null, () => {}, null)
              }
            })
          } catch (e) {
            dispatch(displayNotification('Gist load error', e.message, 'OK', null, () => { dispatch(hideNotification()) }, null))
            console.error(e)
          }
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
    dispatch(displayNotification('Workspaces', 'Workspaces have not been created on your system. Please use "Migrate old filesystem to workspace" on the home page to transfer your files or start by creating a new workspace in the File Explorers.', 'OK', null, () => { dispatch(hideNotification()) }, null))
    console.log(e)
  }
}

const listenOnEvents = (provider) => {
  provider.event.on('fileAdded', async (filePath) => {
    await executeEvent('fileAdded', filePath)
  })

  provider.event.on('folderAdded', async (folderPath) => {
    await executeEvent('folderAdded', folderPath)
  })

  provider.event.on('fileRemoved', async (removePath) => {
    await executeEvent('fileRemoved', removePath)
  })

  plugin.on('remixd', 'rootFolderChanged', async (path) => {
    await executeEvent('rootFolderChanged', path)
  })

  provider.event.on('disconnected', () => {
    dispatch(setMode('browser'))
  })
  // provider.event.on('connected', () => {
  //   remixdExplorer.show()
  //   setWorkspace(LOCALHOST)
  // })

  // provider.event.on('disconnected', () => {
  //   remixdExplorer.hide()
  // })

  // provider.event.on('loading', () => {
  //   remixdExplorer.loading()
  // })

  provider.event.on('fileExternallyChanged', async (path: string, file: { content: string }) => {
    const config = plugin.registry.get('config').api
    const editor = plugin.registry.get('editor').api

    if (config.get('currentFile') === path && editor.currentContent() !== file.content) {
      if (provider.isReadOnly(path)) return editor.setText(file.content)
      dispatch(displayNotification(
        path + ' changed',
        'This file has been changed outside of Remix IDE.',
        'Replace by the new content', 'Keep the content displayed in Remix',
        () => {
          editor.setText(file.content)
        }
      ))
    }
  })
  provider.event.on('fileRenamedError', async () => {
    dispatch(displayNotification('File Renamed Failed', '', 'Ok', 'Cancel'))
  })
}

export const initWorkspace = (filePanelPlugin) => async (reducerDispatch: React.Dispatch<any>) => {
  if (filePanelPlugin) {
    plugin = filePanelPlugin
    dispatch = reducerDispatch
    const workspaceProvider = filePanelPlugin.fileProviders.workspace
    const localhostProvider = filePanelPlugin.fileProviders.localhost
    const queryParams = new QueryParams()
    const params = queryParams.get()
    const workspaces = await getWorkspaces() || []

    if (params.gist) {
      await createWorkspaceTemplate('gist-sample', true, 'gist-template')
      dispatch(setCurrentWorkspace('gist-sample'))
    } else if (params.code || params.url) {
      await createWorkspaceTemplate('code-sample', true, 'code-template')
      dispatch(setCurrentWorkspace('code-sample'))
    } else {
      if (workspaces.length === 0) {
        await createWorkspaceTemplate('default_workspace')
        dispatch(setCurrentWorkspace('default_workspace'))
      } else {
        if (workspaces.length > 0) {
          workspaceProvider.setWorkspace(workspaces[workspaces.length - 1])
          dispatch(setCurrentWorkspace(workspaces[workspaces.length - 1]))
        }
      }
    }

    listenOnEvents(workspaceProvider)
    listenOnEvents(localhostProvider)
    // provider.event.on('fileRenamed', async (oldPath) => {
    //   await executeEvent('fileRenamed', oldPath)
    // })

    // provider.event.on('createWorkspace', (name) => {
    //   createNewWorkspace(name)
    // })
    // dispatch(setWorkspaces(workspaces))
    dispatch(setMode('browser'))
  }
}

export const fetchDirectory = (path: string) => (dispatch: React.Dispatch<any>) => {
  const provider = plugin.fileManager.currentFileProvider()
  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

      resolve(fileTree)
    })
  })

  dispatch(fetchDirectoryRequest(promise))
  promise.then((fileTree) => {
    dispatch(fetchDirectorySuccess(path, fileTree))
  }).catch((error) => {
    dispatch(fetchDirectoryError({ error }))
  })
  return promise
}

const fileAdded = async (filePath: string) => {
  await dispatch(fileAddedSuccess(filePath))
  if (filePath.includes('_test.sol')) {
    plugin.emit('newTestFileCreated', filePath)
  }
}

const folderAdded = async (folderPath: string) => {
  await dispatch(folderAddedSuccess(folderPath))
}

const fileRemoved = async (removePath: string) => {
  await dispatch(fileRemovedSuccess(removePath))
}

// const fileRenamed = async (oldPath: string) => {
//   const path = extractParentFromKey(oldPath) || provider.workspace || provider.type || ''
//   const data = await fetchDirectoryContent(provider, path)

//   await dispatch(fileRenamedSuccess(path, oldPath, data))
// }

const rootFolderChanged = async (path) => {
  await dispatch(rootFolderChangedSuccess(path))
}

const executeEvent = async (eventName: 'fileAdded' | 'folderAdded' | 'fileRemoved' | 'fileRenamed' | 'rootFolderChanged', path?: string) => {
  if (Object.keys(pendingEvents).length) {
    return queuedEvents.push({ eventName, path })
  }
  pendingEvents[eventName + path] = { eventName, path }
  switch (eventName) {
    case 'fileAdded':
      await fileAdded(path)
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'folderAdded':
      await folderAdded(path)
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'fileRemoved':
      await fileRemoved(path)
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

      // case 'fileRenamed':
      //   await fileRenamed(path)
      //   delete pendingEvents[eventName + path]
      //   if (queuedEvents.length) {
      //     const next = queuedEvents.pop()

      //     await executeEvent(next.eventName, next.path)
      //   }
      //   break

    case 'rootFolderChanged':
      await rootFolderChanged(path)
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break
  }
}
