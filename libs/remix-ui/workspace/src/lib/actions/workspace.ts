import React from 'react'
import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import axios, { AxiosResponse } from 'axios'
import { checkSpecialChars, checkSlash } from '@remix-ui/helper'

const QueryParams = require('../../../../../../apps/remix-ide/src/lib/query-params')
const examples = require('../../../../../../apps/remix-ide/src/app/editor/examples')
// const queuedEvents = []
// const pendingEvents = {}
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

export const displayNotification = (title: string, message: string, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void) => {
  return {
    type: 'DISPLAY_NOTIFICATION',
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

export const hideNotification = () => {
  return {
    type: 'DISPLAY_NOTIFICATION'
  }
}

export const fetchDirectory = (mode: 'browser' | 'localhost', path: string) => (dispatch: React.Dispatch<any>) => {
  const provider = mode === 'browser' ? plugin.fileProviders.workspace : plugin.fileProviders.localhost
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

            console.log('data: ', data)
            if (!data.files) {
              dispatch(displayNotification('Gist load error', 'No files found', 'OK', null, () => {}, null))
              return
            }
            // const obj = {}

            // Object.keys(data.files).forEach((element) => {
            //   const path = element.replace(/\.\.\./g, '/')

            //   obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
            // })
            // fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
            //   if (!errorLoadingFile) {
            //     const provider = fileManager.getProvider('workspace')

            //     provider.lastLoadedGistId = gistId
            //   } else {
            //     // modalDialogCustom.alert('', errorLoadingFile.message || errorLoadingFile)
            //   }
            // })
          } catch (e) {
            dispatch(displayNotification('Gist load error', e.message, 'OK', null, () => {}, null))
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
    // modalDialogCustom.alert('Workspaces have not been created on your system. Please use "Migrate old filesystem to workspace" on the home page to transfer your files or start by creating a new workspace in the File Explorers.')
    console.log(e)
  }
}

export const initWorkspace = (filePanelPlugin) => async (reducerDispatch: React.Dispatch<any>) => {
  if (filePanelPlugin) {
    plugin = filePanelPlugin
    dispatch = reducerDispatch
    const provider = filePanelPlugin.fileProviders.workspace
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
          provider.setWorkspace(workspaces[workspaces.length - 1])
          dispatch(setCurrentWorkspace(workspaces[workspaces.length - 1]))
        }
      }
    }
    // provider.event.on('fileAdded', async (filePath) => {
    //   await executeEvent('fileAdded', filePath)
    // })
    // provider.event.on('folderAdded', async (folderPath) => {
    //   await executeEvent('folderAdded', folderPath)
    // })
    // provider.event.on('fileRemoved', async (removePath) => {
    //   await executeEvent('fileRemoved', removePath)
    // })
    // provider.event.on('fileRenamed', async (oldPath) => {
    //   await executeEvent('fileRenamed', oldPath)
    // })
    // provider.event.on('rootFolderChanged', async () => {
    //   await executeEvent('rootFolderChanged')
    // })
    // provider.event.on('fileExternallyChanged', async (path: string, file: { content: string }) => {
    //   const config = plugin.registry.get('config').api
    //   const editor = plugin.registry.get('editor').api

    //   if (config.get('currentFile') === path && editor.currentContent() !== file.content) {
    //     if (provider.isReadOnly(path)) return editor.setText(file.content)
    //     dispatch(displayNotification(
    //       path + ' changed',
    //       'This file has been changed outside of Remix IDE.',
    //       'Replace by the new content', 'Keep the content displayed in Remix',
    //       () => {
    //         editor.setText(file.content)
    //       }
    //     ))
    //   }
    // })
    // provider.event.on('fileRenamedError', async () => {
    //   dispatch(displayNotification('File Renamed Failed', '', 'Ok', 'Cancel'))
    // })
    // dispatch(fetchProviderSuccess(provider))

    // provider.event.on('createWorkspace', (name) => {
    //   createNewWorkspace(name)
    // })
    // dispatch(setWorkspaces(workspaces))
    dispatch(setMode('browser'))
  }
}

export const initLocalhost = (filePanelPlugin) => async (dispatch: React.Dispatch<any>) => {
  if (filePanelPlugin) {
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
    dispatch(setMode('localhost'))
  }
}

// const fileAdded = async (filePath: string) => {
//   if (extractParentFromKey(filePath) === '/.workspaces') return
//   const path = extractParentFromKey(filePath) || provider.workspace || provider.type || ''
//   const data = await fetchDirectoryContent(provider, path)

//   await dispatch(fileAddedSuccess(path, data))
//   if (filePath.includes('_test.sol')) {
//     plugin.emit('newTestFileCreated', filePath)
//   }
// }

// const folderAdded = async (folderPath: string) => {
//   if (extractParentFromKey(folderPath) === '/.workspaces') return
//   const path = extractParentFromKey(folderPath) || provider.workspace || provider.type || ''
//   const data = await fetchDirectoryContent(provider, path)

//   await dispatch(folderAddedSuccess(path, data))
// }

// const fileRemoved = async (removePath: string) => {
//   const path = extractParentFromKey(removePath) || provider.workspace || provider.type || ''

//   await dispatch(fileRemovedSuccess(path, removePath))
// }

// const fileRenamed = async (oldPath: string) => {
//   const path = extractParentFromKey(oldPath) || provider.workspace || provider.type || ''
//   const data = await fetchDirectoryContent(provider, path)

//   await dispatch(fileRenamedSuccess(path, oldPath, data))
// }

// const rootFolderChanged = async () => {
//   const workspaceName = provider.workspace || provider.type || ''

//   await fetchDirectory(provider, workspaceName)(dispatch)
// }

// const executeEvent = async (eventName: 'fileAdded' | 'folderAdded' | 'fileRemoved' | 'fileRenamed' | 'rootFolderChanged', path?: string) => {
//   if (Object.keys(pendingEvents).length) {
//     return queuedEvents.push({ eventName, path })
//   }
//   pendingEvents[eventName + path] = { eventName, path }
//   switch (eventName) {
//     case 'fileAdded':
//       await fileAdded(path)
//       delete pendingEvents[eventName + path]
//       if (queuedEvents.length) {
//         const next = queuedEvents.pop()

//         await executeEvent(next.eventName, next.path)
//       }
//       break

//     case 'folderAdded':
//       await folderAdded(path)
//       delete pendingEvents[eventName + path]
//       if (queuedEvents.length) {
//         const next = queuedEvents.pop()

//         await executeEvent(next.eventName, next.path)
//       }
//       break

//     case 'fileRemoved':
//       await fileRemoved(path)
//       delete pendingEvents[eventName + path]
//       if (queuedEvents.length) {
//         const next = queuedEvents.pop()

//         await executeEvent(next.eventName, next.path)
//       }
//       break

//     case 'fileRenamed':
//       await fileRenamed(path)
//       delete pendingEvents[eventName + path]
//       if (queuedEvents.length) {
//         const next = queuedEvents.pop()

//         await executeEvent(next.eventName, next.path)
//       }
//       break

//     case 'rootFolderChanged':
//       await rootFolderChanged()
//       delete pendingEvents[eventName + path]
//       if (queuedEvents.length) {
//         const next = queuedEvents.pop()

//         await executeEvent(next.eventName, next.path)
//       }
//       break
//   }
// }
