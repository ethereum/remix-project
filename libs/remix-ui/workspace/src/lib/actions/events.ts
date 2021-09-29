import { extractParentFromKey } from '@remix-ui/helper'
import React from 'react'
import { action } from '../types'
import { displayNotification, displayPopUp, fileAddedSuccess, fileRemovedSuccess, fileRenamedSuccess, folderAddedSuccess, loadLocalhostError, loadLocalhostRequest, loadLocalhostSuccess, removeContextMenuItem, rootFolderChangedSuccess, setContextMenuItem, setMode, setReadOnlyMode } from './payload'
import { addInputField, createWorkspace, fetchWorkspaceDirectory, renameWorkspace, switchToWorkspace, uploadFile } from './workspace'

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
    setTimeout(() => rootFolderChanged(path), 0)
  })
}

export const listenOnProviderEvents = (provider) => async (reducerDispatch: React.Dispatch<any>) => {
  dispatch = reducerDispatch

  provider.event.on('fileAdded', (filePath: string) => {
    setTimeout(() => fileAdded(filePath), 0)
  })

  provider.event.on('folderAdded', (folderPath: string) => {
    if (folderPath.indexOf('/.workspaces') === 0) return
    setTimeout(() => folderAdded(folderPath), 0)
  })

  provider.event.on('fileRemoved', (removePath: string) => {
    setTimeout(() => fileRemoved(removePath), 0)
  })

  provider.event.on('fileRenamed', (oldPath: string) => {
    setTimeout(() => fileRenamed(oldPath), 0)
  })

  provider.event.on('disconnected', () => {
    setTimeout(async () => {
      plugin.fileManager.setMode('browser')
      dispatch(setMode('browser'))
      dispatch(loadLocalhostError('Remixd disconnected!'))
      const workspaceProvider = plugin.fileProviders.workspace

      await switchToWorkspace(workspaceProvider.workspace)
    }, 0)
  })

  provider.event.on('connected', async () => {
    setTimeout(() => {
      plugin.fileManager.setMode('localhost')
      dispatch(setMode('localhost'))
      fetchWorkspaceDirectory('/')
      dispatch(loadLocalhostSuccess())
    }, 0)
  })

  provider.event.on('loadingLocalhost', async () => {
    setTimeout(async () => {
      await switchToWorkspace(LOCALHOST)
      dispatch(loadLocalhostRequest())
    }, 0)
  })

  provider.event.on('fileExternallyChanged', async (path: string, file: { content: string }) => {
    setTimeout(() => {
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
    }, 0)
  })

  provider.event.on('fileRenamedError', async () => {
    setTimeout(() => dispatch(displayNotification('File Renamed Failed', '', 'Ok', 'Cancel')), 0)
  })

  provider.event.on('readOnlyModeChanged', (mode: boolean) => {
    setTimeout(() => dispatch(setReadOnlyMode(mode)), 0)
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
    folderPath = folderPath.replace(/^\/+/, '')
    dispatch(folderAddedSuccess(path, folderPath, files))
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
