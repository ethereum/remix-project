import React from 'react'

const queuedEvents = []
const pendingEvents = {}
let provider = null
let plugin = null
let dispatch: React.Dispatch<any> = null

export const fetchCompilerError = (error: any) => {
  return {
    type: 'FETCH_COMPILER_ERROR',
    payload: error
  }
}

export const fetchCompilerRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_COMPILER_REQUEST',
    payload: promise
  }
}

export const fetchCompilerSuccess = (compiler) => {
  return {
    type: 'FETCH_COMPILER_SUCCESS',
    payload: compiler
  }
}

export const fetchCompiler = (provider, path: string) => (dispatch: React.Dispatch<any>) => {
  const promise = fetchDirectoryContent(provider, path)

  dispatch(fetchDirectoryRequest(promise))
  promise.then((files) => {
    dispatch(fetchDirectorySuccess(path, files))
  }).catch((error) => {
    dispatch(fetchDirectoryError({ error }))
  })
  return promise
}
