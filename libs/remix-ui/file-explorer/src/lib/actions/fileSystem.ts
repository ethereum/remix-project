import React from 'react'
import { File } from '../types'
import { extractNameFromKey } from '../utils'

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

const normalize = (filesList): any => {
  const folders = {}
  const files = {}

  Object.keys(filesList || {}).forEach(key => {
    key = key.replace(/^\/|\/$/g, '') // remove first and last slash
    let path = key
    path = path.replace(/^\/|\/$/g, '') // remove first and last slash

    if (filesList[key].isDirectory) {
      folders[key] = {
        path,
        name: extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory
      }
    } else {
      files[key] = {
        path,
        name: extractNameFromKey(path),
        isDirectory: filesList[key].isDirectory
      }
    }
  })

  return Object.assign({}, folders, files)
}

const fetchDirectoryContent = async (provider, folderPath: string): Promise<any> => {
  return new Promise((resolve) => {
    provider.resolveDirectory(folderPath, (error, fileTree) => {
      if (error) console.error(error)
      const files = normalize(fileTree)

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

export const setProvider = (provider) => (dispatch: React.Dispatch<any>) => {
  if (provider) {
    dispatch(fetchProviderSuccess(provider))
  } else {
    dispatch(fetchProviderError('No provider available'))
  }
}
