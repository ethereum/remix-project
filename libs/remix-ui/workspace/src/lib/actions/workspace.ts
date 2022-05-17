import React from 'react'
import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import axios, { AxiosResponse } from 'axios'
import { addInputFieldSuccess, createWorkspaceError, createWorkspaceRequest, createWorkspaceSuccess, displayNotification, fetchWorkspaceDirectoryError, fetchWorkspaceDirectoryRequest, fetchWorkspaceDirectorySuccess, hideNotification, setCurrentWorkspace, setDeleteWorkspace, setMode, setReadOnlyMode, setRenameWorkspace } from './payload'
import { checkSlash, checkSpecialChars } from '@remix-ui/helper'

import { JSONStandardInput, WorkspaceTemplate } from '../types'
import { QueryParams } from '@remix-project/remix-lib'
import * as templateWithContent from '@remix-project/remix-ws-templates'


const LOCALHOST = ' - connect to localhost - '
const NO_WORKSPACE = ' - none - '
const queryParams = new QueryParams()
const _paq = window._paq = window._paq || [] //eslint-disable-line
let plugin, dispatch: React.Dispatch<any>

export const setPlugin = (filePanelPlugin, reducerDispatch) => {
  plugin = filePanelPlugin
  dispatch = reducerDispatch
}

export const addInputField = async (type: 'file' | 'folder', path: string, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  const provider = plugin.fileManager.currentFileProvider()
  const promise = new Promise((resolve, reject) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) {
        cb && cb(error)
        return reject(error)
      }

      cb && cb(null, true)
      resolve(fileTree)
    })
  })

  promise.then((files) => {
    dispatch(addInputFieldSuccess(path, files, type))
  }).catch((error) => {
    console.error(error)
  })
  return promise
}

export const createWorkspace = async (workspaceName: string, workspaceTemplateName: WorkspaceTemplate, isEmpty = false, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  await plugin.fileManager.closeAllFiles()
  const promise = createWorkspaceTemplate(workspaceName, workspaceTemplateName)

  dispatch(createWorkspaceRequest(promise))
  promise.then(async () => {
    dispatch(createWorkspaceSuccess(workspaceName))
    await plugin.setWorkspace({ name: workspaceName, isLocalhost: false })
    await plugin.setWorkspaces(await getWorkspaces())
    await plugin.workspaceCreated(workspaceName)
    if (!isEmpty) await loadWorkspacePreset(workspaceTemplateName)
    cb && cb(null, workspaceName)
  }).catch((error) => {
    dispatch(createWorkspaceError({ error }))
    cb && cb(error)
  })
  return promise
}

export const createWorkspaceTemplate = async (workspaceName: string, template: WorkspaceTemplate = 'remixDefault') => {
  if (!workspaceName) throw new Error('workspace name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName) && template === 'remixDefault') throw new Error('workspace already exists')
  else {
    const workspaceProvider = plugin.fileProviders.workspace

    await workspaceProvider.createWorkspace(workspaceName)
  }
}

export type UrlParametersType = {
  gist: string,
  code: string,
  url: string
}

export const loadWorkspacePreset = async (template: WorkspaceTemplate = 'remixDefault') => {
  const workspaceProvider = plugin.fileProviders.workspace
  const params = queryParams.get() as UrlParametersType

  switch (template) {
    case 'code-template':
    // creates a new workspace code-sample and loads code from url params.
    try {
      let path = ''; let content
      
      if (params.code) {
        const hash = bufferToHex(keccakFromString(params.code))

        path = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
        content = atob(params.code)
        await workspaceProvider.set(path, content)
      }
      if (params.url) {
        const data = await plugin.call('contentImport', 'resolve', params.url)

        path = data.cleanUrl
        content = data.content

        try {
          content = JSON.parse(content) as any
          if (content.language && content.language === "Solidity" && content.sources) {
            const standardInput: JSONStandardInput = content as JSONStandardInput
            for (const [fname, source] of Object.entries(standardInput.sources)) {
              await workspaceProvider.set(fname, source.content)
            }
            return Object.keys(standardInput.sources)[0]
          } else {
            await workspaceProvider.set(path, JSON.stringify(content))
          }
        } catch (e) {
          console.log(e)
          await workspaceProvider.set(path, content)
        }
      }
      return path
    } catch (e) {
      console.error(e)
    }
    break

    case 'gist-template':
      // creates a new workspace gist-sample and get the file from gist
      try {
        const gistId = params.gist
        const response: AxiosResponse = await axios.get(`https://api.github.com/gists/${gistId}`)
        const data = response.data as { files: any }

        if (!data.files) {
          return dispatch(displayNotification('Gist load error', 'No files found', 'OK', null, () => { dispatch(hideNotification()) }, null))
        }
        const obj = {}

        Object.keys(data.files).forEach((element) => {
          const path = element.replace(/\.\.\./g, '/')

          obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
        })
        plugin.fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
          if (errorLoadingFile) {
            dispatch(displayNotification('', errorLoadingFile.message || errorLoadingFile, 'OK', null, () => {}, null))
          }
        })
      } catch (e) {
        dispatch(displayNotification('Gist load error', e.message, 'OK', null, () => { dispatch(hideNotification()) }, null))
        console.error(e)
      }
      break

    default:
      try {
        const templateList = Object.keys(templateWithContent)
        if (!templateList.includes(template)) break
        _paq.push(['trackEvent', 'workspace', 'template', template])
        // @ts-ignore
        const files = await templateWithContent[template]()
        for (const file in files) {
          try {
            await workspaceProvider.set(file, files[file])
          } catch (error) {
            console.error(error)
          }
        }
      } catch (e) {
        dispatch(displayNotification('Workspace load error', e.message, 'OK', null, () => { dispatch(hideNotification()) }, null))
        console.error(e)
      }
      break
  }
}

export const workspaceExists = async (name: string) => {
  const workspaceProvider = plugin.fileProviders.workspace
  const browserProvider = plugin.fileProviders.browser
  const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name

  return await browserProvider.exists(workspacePath)
}

export const fetchWorkspaceDirectory = async (path: string) => {
  if (!path) return
  const provider = plugin.fileManager.currentFileProvider()
  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

      resolve(fileTree)
    })
  })

  dispatch(fetchWorkspaceDirectoryRequest(promise))
  promise.then((fileTree) => {
    dispatch(fetchWorkspaceDirectorySuccess(path, fileTree))
  }).catch((error) => {
    dispatch(fetchWorkspaceDirectoryError({ error }))
  })
  return promise
}

export const renameWorkspace = async (oldName: string, workspaceName: string, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  await renameWorkspaceFromProvider(oldName, workspaceName)
  await dispatch(setRenameWorkspace(oldName, workspaceName))
  await plugin.setWorkspace({ name: workspaceName, isLocalhost: false })
  await plugin.workspaceRenamed(oldName, workspaceName)
  cb && cb(null, workspaceName)
}

export const renameWorkspaceFromProvider = async (oldName: string, workspaceName: string) => {
  if (!workspaceName) throw new Error('name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName)) throw new Error('workspace already exists')
  const browserProvider = plugin.fileProviders.browser
  const workspaceProvider = plugin.fileProviders.workspace
  const workspacesPath = workspaceProvider.workspacesPath
  await browserProvider.rename('browser/' + workspacesPath + '/' + oldName, 'browser/' + workspacesPath + '/' + workspaceName, true)
  await workspaceProvider.setWorkspace(workspaceName)
  await plugin.setWorkspaces(await getWorkspaces())
}

export const deleteWorkspace = async (workspaceName: string, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  await deleteWorkspaceFromProvider(workspaceName)
  await dispatch(setDeleteWorkspace(workspaceName))
  plugin.workspaceDeleted(workspaceName)
  cb && cb(null, workspaceName)
}

const deleteWorkspaceFromProvider = async (workspaceName: string) => {
  const workspacesPath = plugin.fileProviders.workspace.workspacesPath

  await plugin.fileManager.closeAllFiles()
  await plugin.fileProviders.browser.remove(workspacesPath + '/' + workspaceName)
  await plugin.setWorkspaces(await getWorkspaces())
}

export const switchToWorkspace = async (name: string) => {
  await plugin.fileManager.closeAllFiles()
  if (name === LOCALHOST) {
    const isActive = await plugin.call('manager', 'isActive', 'remixd')

    if (!isActive) await plugin.call('manager', 'activatePlugin', 'remixd')
    dispatch(setMode('localhost'))
    plugin.emit('setWorkspace', { name: null, isLocalhost: true })
  } else if (name === NO_WORKSPACE) {
    await plugin.fileProviders.workspace.clearWorkspace()
    await plugin.setWorkspace({ name: null, isLocalhost: false })
    dispatch(setCurrentWorkspace(null))
  } else {
    const isActive = await plugin.call('manager', 'isActive', 'remixd')

    if (isActive) await plugin.call('manager', 'deactivatePlugin', 'remixd')
    await plugin.fileProviders.workspace.setWorkspace(name)
    await plugin.setWorkspace({ name, isLocalhost: false })
    dispatch(setMode('browser'))
    dispatch(setCurrentWorkspace(name))
    dispatch(setReadOnlyMode(false))
  }
}

export const uploadFile = async (target, targetFolder: string, cb?: (err: Error, result?: string | number | boolean | Record<string, any>) => void) => {
  // TODO The file explorer is merely a view on the current state of
  // the files module. Please ask the user here if they want to overwrite
  // a file and then just use `files.add`. The file explorer will
  // pick that up via the 'fileAdded' event from the files module.
  [...target.files].forEach(async (file) => {
    const workspaceProvider = plugin.fileProviders.workspace
    const loadFile = (name: string): void => {
      const fileReader = new FileReader()

      fileReader.onload = async function (event) {
        if (checkSpecialChars(file.name)) {
          return dispatch(displayNotification('File Upload Failed', 'Special characters are not allowed', 'Close', null, async () => {}))
        }
        try {
          await workspaceProvider.set(name, event.target.result)
        } catch (error) {
          return dispatch(displayNotification('File Upload Failed', 'Failed to create file ' + name, 'Close', null, async () => {}))
        }

        const config = plugin.registry.get('config').api
        const editor = plugin.registry.get('editor').api

        if ((config.get('currentFile') === name) && (editor.currentContent() !== event.target.result)) {
          editor.setText(event.target.result)
        }
      }
      fileReader.readAsText(file)
      cb && cb(null, true)
    }
    const name = targetFolder === '/' ? file.name : `${targetFolder}/${file.name}`

    if (!await workspaceProvider.exists(name)) {
      loadFile(name)
    } else {
      dispatch(displayNotification('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, 'OK', null, () => {
        loadFile(name)
      }, () => {}))
    }
  })
}

export const getWorkspaces = async (): Promise<string[]> | undefined => {
  try {
    const workspaces: string[] = await new Promise((resolve, reject) => {
      const workspacesPath = plugin.fileProviders.workspace.workspacesPath

      plugin.fileProviders.browser.resolveDirectory('/' + workspacesPath, (error, items) => {
        if (error) {
          return reject(error)
        }
        resolve(Object.keys(items)
          .filter((item) => items[item].isDirectory)
          .map((folder) => folder.replace(workspacesPath + '/', '')))
      })
    })

    await plugin.setWorkspaces(workspaces)
    return workspaces
  } catch (e) {}
}
