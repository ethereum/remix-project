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
    rootFolderChanged(path)
  })
}

export const listenOnProviderEvents = (provider) => (reducerDispatch: React.Dispatch<any>) => {
  dispatch = reducerDispatch

  provider.event.on('fileAdded', (filePath: string) => {
    fileAdded(filePath)
  })

  provider.event.on('folderAdded', (folderPath: string) => {
    if (folderPath.indexOf('/.workspaces') === 0) return
    folderAdded(folderPath)
  })

  provider.event.on('fileRemoved', (removePath: string) => {
    fileRemoved(removePath)
  })

  provider.event.on('fileRenamed', (oldPath: string) => {
    fileRenamed(oldPath)
  })

  provider.event.on('disconnected', async () => {
    plugin.fileManager.setMode('browser')
    dispatch(setMode('browser'))
    dispatch(loadLocalhostError('Remixd disconnected!'))
    const workspaceProvider = plugin.fileProviders.workspace

    await switchToWorkspace(workspaceProvider.workspace)
  })

  provider.event.on('connected', () => {
    plugin.fileManager.setMode('localhost')
    dispatch(setMode('localhost'))
    fetchWorkspaceDirectory('/')
    dispatch(loadLocalhostSuccess())
  })

  provider.event.on('loadingLocalhost', async () => {
    await switchToWorkspace(LOCALHOST)
    dispatch(loadLocalhostRequest())
  })

  provider.event.on('fileExternallyChanged', (path: string, content: string) => {
    const config = plugin.registry.get('config').api
    const editor = plugin.registry.get('editor').api

    if (config.get('currentFile') === path && editor.currentContent() !== content) {
      if (provider.isReadOnly(path)) return editor.setText(content)
      dispatch(displayNotification(
        path + ' changed',
        'This file has been changed outside of Remix IDE.',
        'Replace by the new content', 'Keep the content displayed in Remix',
        () => {
          editor.setText(content)
        }
      ))
    }
  })

  provider.event.on('fileRenamedError', () => {
    dispatch(displayNotification('File Renamed Failed', '', 'Ok', 'Cancel'))
  })

  provider.event.on('readOnlyModeChanged', (mode: boolean) => {
    dispatch(setReadOnlyMode(mode))
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
