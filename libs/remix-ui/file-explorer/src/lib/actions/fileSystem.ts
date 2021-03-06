import React from 'react'
import { File } from '../types'
import { extractNameFromKey, extractParentFromKey } from '../utils'

const queuedEvents = []
const pendingEvents = {}
let provider = null
let plugin = null
let dispatch: React.Dispatch<any> = null

export const fetchDirectoryError = (error: any) => {
  return {
    type: 'FETCH_DIRECTORY_ERROR',
    payload: error
  }
}

export const fetchDirectoryRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_DIRECTORY_REQUEST',
    payload: promise
  }
}

export const fetchDirectorySuccess = (path: string, files: File[]) => {
  return {
    type: 'FETCH_DIRECTORY_SUCCESS',
    payload: { path, files }
  }
}

export const fileSystemReset = () => {
  return {
    type: 'FILESYSTEM_RESET'
  }
}

const normalize = (parent, filesList, newInputType?: string): any => {
  const folders = {}
  const files = {}

  Object.keys(filesList || {}).forEach(key => {
    key = key.replace(/^\/|\/$/g, '') // remove first and last slash
    let path = key
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash

    if (filesList[key].isDirectory) {
      folders[extractNameFromKey(key)] = {
        path,
        name: extractNameFromKey(path).indexOf('gist-') === 0 ? extractNameFromKey(path).split('-')[1] : extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory,
        type: extractNameFromKey(path).indexOf('gist-') === 0 ? 'gist' : 'folder'
      }
    } else {
      files[extractNameFromKey(key)] = {
        path,
        name: extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory,
        type: 'file'
      }
    }
  })

  if (newInputType === 'folder') {
    const path = parent + '/blank'

    folders[path] = {
      path: path,
      name: '',
      isDirectory: true,
      type: 'folder'
    }
  } else if (newInputType === 'file') {
    const path = parent + '/blank'

    files[path] = {
      path: path,
      name: '',
      isDirectory: false,
      type: 'file'
    }
  }

  return Object.assign({}, folders, files)
}

const fetchDirectoryContent = async (provider, folderPath: string, newInputType?: string): Promise<any> => {
  return new Promise((resolve) => {
    provider.resolveDirectory(folderPath, (error, fileTree) => {
      if (error) console.error(error)
      const files = normalize(folderPath, fileTree, newInputType)

      resolve({ [extractNameFromKey(folderPath)]: files })
    })
  })
}

export const fetchDirectory = (provider, path: string) => (dispatch: React.Dispatch<any>) => {
  const promise = fetchDirectoryContent(provider, path)

  dispatch(fetchDirectoryRequest(promise))
  promise.then((files) => {
    dispatch(fetchDirectorySuccess(path, files))
  }).catch((error) => {
    dispatch(fetchDirectoryError({ error }))
  })
  return promise
}

export const resolveDirectoryError = (error: any) => {
  return {
    type: 'RESOLVE_DIRECTORY_ERROR',
    payload: error
  }
}

export const resolveDirectoryRequest = (promise: Promise<any>) => {
  return {
    type: 'RESOLVE_DIRECTORY_REQUEST',
    payload: promise
  }
}

export const resolveDirectorySuccess = (path: string, files: File[]) => {
  return {
    type: 'RESOLVE_DIRECTORY_SUCCESS',
    payload: { path, files }
  }
}

export const resolveDirectory = (provider, path: string) => (dispatch: React.Dispatch<any>) => {
  const promise = fetchDirectoryContent(provider, path)

  dispatch(resolveDirectoryRequest(promise))
  promise.then((files) => {
    dispatch(resolveDirectorySuccess(path, files))
  }).catch((error) => {
    dispatch(resolveDirectoryError({ error }))
  })
  return promise
}

export const fetchProviderError = (error: any) => {
  return {
    type: 'FETCH_PROVIDER_ERROR',
    payload: error
  }
}

export const fetchProviderRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_PROVIDER_REQUEST',
    payload: promise
  }
}

export const fetchProviderSuccess = (provider: any) => {
  return {
    type: 'FETCH_PROVIDER_SUCCESS',
    payload: provider
  }
}

export const fileAddedSuccess = (path: string, files) => {
  return {
    type: 'FILE_ADDED',
    payload: { path, files }
  }
}

export const folderAddedSuccess = (path: string, files) => {
  return {
    type: 'FOLDER_ADDED',
    payload: { path, files }
  }
}

export const fileRemovedSuccess = (path: string, removePath: string) => {
  return {
    type: 'FILE_REMOVED',
    payload: { path, removePath }
  }
}

export const fileRenamedSuccess = (path: string, removePath: string, files) => {
  return {
    type: 'FILE_RENAMED',
    payload: { path, removePath, files }
  }
}

export const init = (fileProvider, filePanel, registry) => (reducerDispatch: React.Dispatch<any>) => {
  provider = fileProvider
  plugin = filePanel
  dispatch = reducerDispatch
  if (provider) {
    provider.event.on('fileAdded', async (filePath) => {
      await executeEvent('fileAdded', filePath)
    })
    provider.event.on('folderAdded', async (folderPath) => {
      await executeEvent('folderAdded', folderPath)
    })
    provider.event.on('fileRemoved', async (removePath) => {
      await executeEvent('fileRemoved', removePath)
    })
    provider.event.on('fileRenamed', async (oldPath) => {
      await executeEvent('fileRenamed', oldPath)
    })
    provider.event.on('rootFolderChanged', async () => {
      await executeEvent('rootFolderChanged')
    })
    provider.event.on('fileExternallyChanged', async (path: string, file: { content: string }) => {
      const config = registry.get('config').api
      const editor = registry.get('editor').api

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
    dispatch(fetchProviderSuccess(provider))
  } else {
    dispatch(fetchProviderError('No provider available'))
  }
}

export const setCurrentWorkspace = (name: string) => {
  return {
    type: 'SET_CURRENT_WORKSPACE',
    payload: name
  }
}

export const addInputFieldSuccess = (path: string, files: File[]) => {
  return {
    type: 'ADD_INPUT_FIELD',
    payload: { path, files }
  }
}

export const addInputField = (provider, type: string, path: string) => (dispatch: React.Dispatch<any>) => {
  const promise = fetchDirectoryContent(provider, path, type)

  promise.then((files) => {
    dispatch(addInputFieldSuccess(path, files))
  }).catch((error) => {
    console.error(error)
  })
  return promise
}

export const removeInputFieldSuccess = (path: string) => {
  return {
    type: 'REMOVE_INPUT_FIELD',
    payload: { path }
  }
}

export const removeInputField = (path: string) => (dispatch: React.Dispatch<any>) => {
  return dispatch(removeInputFieldSuccess(path))
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

export const closeNotificationModal = () => (dispatch: React.Dispatch<any>) => {
  dispatch(hideNotification())
}

const fileAdded = async (filePath: string) => {
  if (extractParentFromKey(filePath) === '/.workspaces') return
  const path = extractParentFromKey(filePath) || provider.workspace || provider.type || ''
  const data = await fetchDirectoryContent(provider, path)

  await dispatch(fileAddedSuccess(path, data))
  if (filePath.includes('_test.sol')) {
    plugin.emit('newTestFileCreated', filePath)
  }
}

const folderAdded = async (folderPath: string) => {
  if (extractParentFromKey(folderPath) === '/.workspaces') return
  const path = extractParentFromKey(folderPath) || provider.workspace || provider.type || ''
  const data = await fetchDirectoryContent(provider, path)

  await dispatch(folderAddedSuccess(path, data))
}

const fileRemoved = async (removePath: string) => {
  const path = extractParentFromKey(removePath) || provider.workspace || provider.type || ''

  await dispatch(fileRemovedSuccess(path, removePath))
}

const fileRenamed = async (oldPath: string) => {
  const path = extractParentFromKey(oldPath) || provider.workspace || provider.type || ''
  const data = await fetchDirectoryContent(provider, path)

  await dispatch(fileRenamedSuccess(path, oldPath, data))
}

const rootFolderChanged = async () => {
  const workspaceName = provider.workspace || provider.type || ''

  await fetchDirectory(provider, workspaceName)(dispatch)
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

    case 'fileRenamed':
      await fileRenamed(path)
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break

    case 'rootFolderChanged':
      await rootFolderChanged()
      delete pendingEvents[eventName + path]
      if (queuedEvents.length) {
        const next = queuedEvents.pop()

        await executeEvent(next.eventName, next.path)
      }
      break
  }
}
