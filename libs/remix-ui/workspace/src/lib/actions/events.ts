import { extractParentFromKey } from '@remix-ui/helper'
import React from 'react'
import { action, WorkspaceTemplate } from '../types'
import { displayNotification, displayPopUp, fileAddedSuccess, fileRemovedSuccess, fileRenamedSuccess, folderAddedSuccess, loadLocalhostError, loadLocalhostRequest, loadLocalhostSuccess, removeContextMenuItem, removeFocus, rootFolderChangedSuccess, setContextMenuItem, setMode, setReadOnlyMode } from './payload'
import { addInputField, createWorkspace, deleteWorkspace, fetchWorkspaceDirectory, renameWorkspace, switchToWorkspace, uploadFile } from './workspace'

const LOCALHOST = ' - connect to localhost - '
let plugin, dispatch: React.Dispatch<any>

export const listenOnPluginEvents = (filePanelPlugin) => {
  plugin = filePanelPlugin

  plugin.on('filePanel', 'createWorkspaceReducerEvent', (name: string, workspaceTemplateName: WorkspaceTemplate, isEmpty = false, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    createWorkspace(name, workspaceTemplateName, isEmpty, cb)
  })

  plugin.on('filePanel', 'renameWorkspaceReducerEvent', (oldName: string, workspaceName: string, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    renameWorkspace(oldName, workspaceName, cb)
  })

  plugin.on('filePanel', 'deleteWorkspaceReducerEvent', (workspaceName: string, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    deleteWorkspace(workspaceName, cb)
  })

  plugin.on('filePanel', 'registerContextMenuItemReducerEvent', (item: action, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    registerContextMenuItem(item, cb)
  })

  plugin.on('filePanel', 'removePluginActionsReducerEvent', (plugin, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    removePluginActions(plugin, cb)
  })

  plugin.on('filePanel', 'createNewFileInputReducerEvent', (path, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    addInputField('file', path, cb)
  })

  plugin.on('filePanel', 'uploadFileReducerEvent', (dir: string, target, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
    uploadFile(target, dir, cb)
  })

  plugin.on('remixd', 'rootFolderChanged', async (path: string) => {
    rootFolderChanged(path)
  })

  plugin.on('fileManager', 'rootFolderChanged', async (path: string) => {
    rootFolderChanged(path)
  })

  plugin.on('fileManager', 'fileClosed', async (file: string) => {
    dispatch(removeFocus(file))
  })

  plugin.on('fileManager', 'currentFileChanged', async (file: string) => {
    const paths = file.split('/')
    if (paths.length && paths[0] === '') paths.shift()
    let currentCheck = ''
    for (const value of paths) {
      currentCheck = currentCheck + '/' + value
      await folderAdded(currentCheck)
    }
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

const registerContextMenuItem = (item: action, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  if (!item) {
    cb && cb(new Error('Invalid register context menu argument'))
    return dispatch(displayPopUp('Invalid register context menu argument'))
  }
  if (!item.name || !item.id) {
    cb && cb(new Error('Item name and id is mandatory'))
    return dispatch(displayPopUp('Item name and id is mandatory'))
  }
  if (!item.type && !item.path && !item.extension && !item.pattern) {
    cb && cb(new Error('Invalid file matching criteria provided'))
    return dispatch(displayPopUp('Invalid file matching criteria provided'))
  }
  dispatch(setContextMenuItem(item))
  cb && cb(null, item)
}

const removePluginActions = (plugin, cb: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  dispatch(removeContextMenuItem(plugin))
  cb && cb(null, true)
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
