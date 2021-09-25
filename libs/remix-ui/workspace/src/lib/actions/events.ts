import { extractParentFromKey } from '@remix-ui/helper'
import React from 'react'
import { action } from '../types'
import { displayNotification, displayPopUp, fileAddedSuccess, fileRemovedSuccess, fileRenamedSuccess, folderAddedSuccess, removeContextMenuItem, rootFolderChangedSuccess, setContextMenuItem } from './payload'
import { addInputField, createWorkspace, fetchWorkspaceDirectory, renameWorkspace, switchToWorkspace, uploadFile } from './workspace'

const queuedEvents = []
const pendingEvents = {}
const LOCALHOST = ' - connect to localhost - '
let plugin, dispatch: React.Dispatch<any>

export const listenOnPluginEvents = (filePanelPlugin) => {
  plugin = filePanelPlugin

  plugin.on('filePanel', 'createWorkspace', (name: string) => {
    createWorkspace(name)
  })

  plugin.on('filePanel', 'renameWorkspace', (oldName: string, workspaceName: string) => {
    renameWorkspace(oldName, workspaceName)
  })

  plugin.on('filePanel', 'registerContextMenuItem', (item: action) => {
    registerContextMenuItem(item)
  })

  plugin.on('filePanel', 'removePluginActions', (plugin) => {
    removePluginActions(plugin)
  })

  plugin.on('filePanel', 'displayNewFileInput', (path) => {
    addInputField('file', path)
  })

  plugin.on('filePanel', 'uploadFileEvent', (dir: string, target) => {
    uploadFile(target, dir)
  })

  plugin.on('remixd', 'rootFolderChanged', async (path: string) => {
    await executeEvent('rootFolderChanged', path)
  })
}

export const listenOnProviderEvents = (provider) => async (reducerDispatch: React.Dispatch<any>) => {
  dispatch = reducerDispatch

  provider.event.on('fileAdded', async (filePath: string) => {
    await executeEvent('fileAdded', filePath)
  })

  provider.event.on('folderAdded', async (folderPath: string) => {
    if (folderPath.indexOf('/.workspaces') === 0) return
    await executeEvent('folderAdded', folderPath)
  })

  provider.event.on('fileRemoved', async (removePath: string) => {
    await executeEvent('fileRemoved', removePath)
  })

  provider.event.on('fileRenamed', async (oldPath: string, newPath: string) => {
    await executeEvent('fileRenamed', oldPath, newPath)
  })

  // provider.event.on('disconnected', () => {
  //   dispatch(setMode('browser'))
  // })

  provider.event.on('connected', async () => {
    fetchWorkspaceDirectory('/')
    // setState(prevState => {
    //   return { ...prevState, hideRemixdExplorer: false, loadingLocalhost: false }
    // })
  })

  provider.event.on('disconnected', async () => {
    const workspaceProvider = plugin.fileProviders.workspace

    await switchToWorkspace(workspaceProvider.workspace)
  })

  provider.event.on('loadingLocalhost', async () => {
    await switchToWorkspace(LOCALHOST)
    // setState(prevState => {
    //   return { ...prevState, loadingLocalhost: true }
    // })
  })

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

const registerContextMenuItem = (item: action) => {
  if (!item) return dispatch(displayPopUp('Invalid register context menu argument'))
  if (!item.name || !item.id) return dispatch(displayPopUp('Item name and id is mandatory'))
  if (!item.type && !item.path && !item.extension && !item.pattern) return dispatch(displayPopUp('Invalid file matching criteria provided'))
  dispatch(setContextMenuItem(item))
}

const removePluginActions = (plugin) => {
  dispatch(removeContextMenuItem(plugin))
}

const fileAdded = async (filePath: string) => {
  await dispatch(fileAddedSuccess(filePath))
  if (filePath.includes('_test.sol')) {
    plugin.emit('newTestFileCreated', filePath)
  }
}

const folderAdded = async (folderPath: string) => {
  const provider = plugin.fileManager.currentFileProvider()
  const path = extractParentFromKey(folderPath) || provider.workspace || provider.type || ''

  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

      resolve(fileTree)
    })
  })

  promise.then((files) => {
    dispatch(folderAddedSuccess(path, files))
  }).catch((error) => {
    console.error(error)
  })
  return promise
}

const fileRemoved = async (removePath: string) => {
  await dispatch(fileRemovedSuccess(removePath))
}

const fileRenamed = async (oldPath: string) => {
  const provider = plugin.fileManager.currentFileProvider()
  const path = extractParentFromKey(oldPath) || provider.workspace || provider.type || ''
  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

      resolve(fileTree)
    })
  })

  promise.then((files) => {
    dispatch(fileRenamedSuccess(path, oldPath, files))
  }).catch((error) => {
    console.error(error)
  })
}

const rootFolderChanged = async (path) => {
  await dispatch(rootFolderChangedSuccess(path))
}

const executeEvent = async (eventName: 'fileAdded' | 'folderAdded' | 'fileRemoved' | 'fileRenamed' | 'rootFolderChanged', ...args) => {
  if (Object.keys(pendingEvents).length) {
    return queuedEvents.push({ eventName, path: args[0] })
  }
  pendingEvents[eventName + args[0]] = { eventName, path: args[0] }
  switch (eventName) {
    case 'fileAdded':
      setTimeout(() => {
        fileAdded(args[0])
      }, 0)
      delete pendingEvents[eventName + args[0]]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'folderAdded':
      setTimeout(() => {
        folderAdded(args[0])
      }, 0)
      delete pendingEvents[eventName + args[0]]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'fileRemoved':
      setTimeout(() => {
        fileRemoved(args[0])
      }, 0)
      delete pendingEvents[eventName + args[0]]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'fileRenamed':
      setTimeout(() => {
        fileRenamed(args[0])
      }, 0)
      delete pendingEvents[eventName + args[0]]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'rootFolderChanged':
      setTimeout(() => {
        rootFolderChanged(args[0])
      }, 0)
      delete pendingEvents[eventName + args[0]]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break
  }
}
