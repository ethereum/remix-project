import React from 'react'
import { File } from '../types'
import { extractNameFromKey, extractParentFromKey } from '../utils'

const globalRegistry = require('../../../../../../apps/remix-ide/src/global/registry')
const fileProviders = globalRegistry.get('fileproviders').api
const browser = fileProviders.browser // eslint-disable-line
const workspace = fileProviders.workspace
const localhost = fileProviders.localhost // eslint-disable-line

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

const normalize = (filesList): File[] => {
  const folders = []
  const files = []

  Object.keys(filesList || {}).forEach(key => {
    key = key.replace(/^\/|\/$/g, '') // remove first and last slash
    let path = key
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash

    if (filesList[key].isDirectory) {
      folders.push({
        path,
        name: extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory
      })
    } else {
      files.push({
        path,
        name: extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory
      })
    }
  })

  return [...folders, ...files]
}

const fetchDirectoryContent = async (folderPath: string): Promise<File[]> => {
  return new Promise((resolve) => {
    workspace.resolveDirectory(folderPath, (error, fileTree) => {
      if (error) console.error(error)
      const files = normalize(fileTree)

      resolve(files)
    })
  })
}

export const fetchDirectory = (path: string) => (dispatch: React.Dispatch<any>) => {
  const promise = fetchDirectoryContent(path)

  dispatch(fetchDirectoryRequest(promise))
  promise.then((files) => {
    dispatch(fetchDirectorySuccess(path, files))
  }).catch((error) => {
    dispatch(fetchDirectoryError({ error }))
  })
  return promise
}
