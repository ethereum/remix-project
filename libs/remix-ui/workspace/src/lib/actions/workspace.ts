import React from 'react'
import { bufferToHex, keccakFromString } from 'ethereumjs-util'
import axios, { AxiosResponse } from 'axios'
import { checkSpecialChars, checkSlash, extractNameFromKey, createNonClashingNameAsync } from '@remix-ui/helper'
import Gists from 'gists'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel/type'
import { addInputFieldSuccess, createWorkspaceError, createWorkspaceRequest, createWorkspaceSuccess, displayNotification, displayPopUp, fetchDirectoryError, fetchDirectoryRequest, fetchDirectorySuccess, fetchWorkspaceDirectoryError, fetchWorkspaceDirectoryRequest, fetchWorkspaceDirectorySuccess, focusElement, hideNotification, hidePopUp, removeInputFieldSuccess, setCurrentWorkspace, setDeleteWorkspace, setMode, setRenameWorkspace, setWorkspaces } from './payload'
import { listenOnPluginEvents, listenOnProviderEvents } from './events'

const QueryParams = require('../../../../../../apps/remix-ide/src/lib/query-params')
const examples = require('../../../../../../apps/remix-ide/src/app/editor/examples')
const LOCALHOST = ' - connect to localhost - '
const NO_WORKSPACE = ' - none - '
const queryParams = new QueryParams()

let plugin, dispatch: React.Dispatch<any>

export const initWorkspace = (filePanelPlugin) => async (reducerDispatch: React.Dispatch<any>) => {
  if (filePanelPlugin) {
    plugin = filePanelPlugin
    dispatch = reducerDispatch
    const workspaceProvider = filePanelPlugin.fileProviders.workspace
    const localhostProvider = filePanelPlugin.fileProviders.localhost
    const params = queryParams.get()
    const workspaces = await getWorkspaces() || []

    dispatch(setWorkspaces(workspaces))
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
          workspaceProvider.setWorkspace(workspaces[workspaces.length - 1])
          dispatch(setCurrentWorkspace(workspaces[workspaces.length - 1]))
        }
      }
    }

    listenOnPluginEvents(plugin)
    listenOnProviderEvents(workspaceProvider)(dispatch)
    listenOnProviderEvents(localhostProvider)(dispatch)
    dispatch(setMode('browser'))
  }
}

export const fetchDirectory = async (path: string) => {
  const provider = plugin.fileManager.currentFileProvider()
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

export const addInputField = async (type: 'file' | 'folder', path: string) => {
  const provider = plugin.fileManager.currentFileProvider()
  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

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

export const removeInputField = async (path: string) => {
  const provider = plugin.fileManager.currentFileProvider()
  const promise = new Promise((resolve) => {
    provider.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)

      resolve(fileTree)
    })
  })

  promise.then((files) => {
    dispatch(removeInputFieldSuccess(path, files))
  }).catch((error) => {
    console.error(error)
  })
  return promise
}

export const createWorkspace = async (workspaceName: string) => {
  console.log('workspaceName: ', workspaceName)
  const promise = createWorkspaceTemplate(workspaceName, true, 'default-template')

  dispatch(createWorkspaceRequest(promise))
  promise.then(async () => {
    await plugin.fileManager.closeAllFiles()
    dispatch(createWorkspaceSuccess(workspaceName))
    switchToWorkspace(workspaceName)
  }).catch((error) => {
    dispatch(createWorkspaceError({ error }))
  })
  return promise
}

export const fetchWorkspaceDirectory = async (path: string) => {
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

export const switchToWorkspace = async (name: string) => {
  await plugin.fileManager.closeAllFiles()
  if (name === LOCALHOST) {
    plugin.fileManager.setMode('localhost')
    const isActive = await plugin.call('manager', 'isActive', 'remixd')

    if (!isActive) await plugin.call('manager', 'activatePlugin', 'remixd')
    dispatch(setMode('localhost'))
    plugin.emit('setWorkspace', { name: LOCALHOST, isLocalhost: true })
  } else if (name === NO_WORKSPACE) {
    plugin.fileProviders.workspace.clearWorkspace()
    dispatch(setCurrentWorkspace(null))
  } else {
    plugin.fileManager.setMode('browser')
    const isActive = await plugin.call('manager', 'isActive', 'remixd')

    if (isActive) plugin.call('manager', 'deactivatePlugin', 'remixd')
    await plugin.fileProviders.workspace.setWorkspace(name)

    dispatch(setMode('browser'))
    dispatch(setCurrentWorkspace(name))
    plugin.emit('setWorkspace', { name, isLocalhost: false })
  }
}

export const renameWorkspace = async (oldName: string, workspaceName: string) => {
  await renameWorkspaceFromProvider(oldName, workspaceName)
  await dispatch(setRenameWorkspace(oldName, workspaceName))
}

export const deleteWorkspace = async (workspaceName: string) => {
  await deleteWorkspaceFromProvider(workspaceName)
  await dispatch(setDeleteWorkspace(workspaceName))
}

export const publishToGist = async (path?: string, type?: string) => {
  // If 'id' is not defined, it is not a gist update but a creation so we have to take the files from the browser explorer.
  const folder = path || '/'
  const id = type === 'gist' ? extractNameFromKey(path).split('-')[1] : null
  try {
    const packaged = await packageGistFiles(folder)
    // check for token
    const config = plugin.registry.get('config').api
    const accessToken = config.get('settings/gist-access-token')

    if (!accessToken) {
      dispatch(displayNotification('Authorize Token', 'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.', 'Close', null, () => {}))
    } else {
      const description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' +
        queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&runs=' + queryParams.get().runs + '&gist='
      const gists = new Gists({ token: accessToken })

      if (id) {
        const originalFileList = await getOriginalFiles(id)
        // Telling the GIST API to remove files
        const updatedFileList = Object.keys(packaged)
        const allItems = Object.keys(originalFileList)
          .filter(fileName => updatedFileList.indexOf(fileName) === -1)
          .reduce((acc, deleteFileName) => ({
            ...acc,
            [deleteFileName]: null
          }), originalFileList)
        // adding new files
        updatedFileList.forEach((file) => {
          const _items = file.split('/')
          const _fileName = _items[_items.length - 1]
          allItems[_fileName] = packaged[file]
        })

        dispatch(displayPopUp('Saving gist (' + id + ') ...'))
        gists.edit({
          description: description,
          public: true,
          files: allItems,
          id: id
        }, (error, result) => {
          handleGistResponse(error, result)
          if (!error) {
            for (const key in allItems) {
              if (allItems[key] === null) delete allItems[key]
            }
          }
        })
      } else {
        // id is not existing, need to create a new gist
        dispatch(displayPopUp('Creating a new gist ...'))
        gists.create({
          description: description,
          public: true,
          files: packaged
        }, (error, result) => {
          handleGistResponse(error, result)
        })
      }
    }
  } catch (error) {
    console.log(error)
    dispatch(displayNotification('Publish to gist Failed', 'Failed to create gist: ' + error.message, 'Close', null, async () => {}))
  }
}

export const clearPopUp = async () => {
  dispatch(hidePopUp())
}

export const uploadFile = async (target, targetFolder: string) => {
  // TODO The file explorer is merely a view on the current state of
  // the files module. Please ask the user here if they want to overwrite
  // a file and then just use `files.add`. The file explorer will
  // pick that up via the 'fileAdded' event from the files module.
  [...target.files].forEach((file) => {
    const workspaceProvider = plugin.fileProviders.workspace
    const loadFile = (name: string): void => {
      const fileReader = new FileReader()

      fileReader.onload = async function (event) {
        if (checkSpecialChars(file.name)) {
          dispatch(displayNotification('File Upload Failed', 'Special characters are not allowed', 'Close', null, async () => {}))
          return
        }
        const success = await workspaceProvider.set(name, event.target.result)

        if (!success) {
          return dispatch(displayNotification('File Upload Failed', 'Failed to create file ' + name, 'Close', null, async () => {}))
        }
        const config = plugin.registry.get('config').api
        const editor = plugin.registry.get('editor').api

        if ((config.get('currentFile') === name) && (editor.currentContent() !== event.target.result)) {
          editor.setText(event.target.result)
        }
      }
      fileReader.readAsText(file)
    }
    const name = `${targetFolder}/${file.name}`

    workspaceProvider.exists(name).then(exist => {
      if (!exist) {
        loadFile(name)
      } else {
        dispatch(displayNotification('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, 'OK', null, () => {
          loadFile(name)
        }, () => {}))
      }
    }).catch(error => {
      if (error) console.log(error)
    })
  })
}

export const createNewFile = async (path: string, rootDir: string) => {
  const fileManager = plugin.fileManager
  const newName = await createNonClashingNameAsync(path, fileManager)
  const createFile = await fileManager.writeFile(newName, '')

  if (!createFile) {
    return dispatch(displayPopUp('Failed to create file ' + newName))
  } else {
    const path = newName.indexOf(rootDir + '/') === 0 ? newName.replace(rootDir + '/', '') : newName

    await fileManager.open(path)
    setFocusElement([{ key: path, type: 'file' }])
  }
}

export const setFocusElement = async (elements: { key: string, type: 'file' | 'folder' | 'gist' }[]) => {
  dispatch(focusElement(elements))
}

export const createNewFolder = async (path: string, rootDir: string) => {
  const fileManager = plugin.fileManager
  const dirName = path + '/'
  const exists = await fileManager.exists(dirName)

  if (exists) {
    return dispatch(displayNotification('Rename File Failed', `A file or folder ${extractNameFromKey(path)} already exists at this location. Please choose a different name.`, 'Close', null, () => {}))
  }
  await fileManager.mkdir(dirName)
  path = path.indexOf(rootDir + '/') === 0 ? path.replace(rootDir + '/', '') : path
  dispatch(focusElement([{ key: path, type: 'folder' }]))
}

export const deletePath = async (path: string[]) => {
  const fileManager = plugin.fileManager

  for (const p of path) {
    try {
      await fileManager.remove(p)
    } catch (e) {
      const isDir = await fileManager.isDirectory(p)

      dispatch(displayPopUp(`Failed to remove ${isDir ? 'folder' : 'file'} ${p}.`))
    }
  }
}

export const renamePath = async (oldPath: string, newPath: string) => {
  const fileManager = plugin.fileManager
  const exists = await fileManager.exists(newPath)

  if (exists) {
    dispatch(displayNotification('Rename File Failed', `A file or folder ${extractNameFromKey(newPath)} already exists at this location. Please choose a different name.`, 'Close', null, () => {}))
  } else {
    await fileManager.rename(oldPath, newPath)
  }
}

export const copyFile = async (src: string, dest: string) => {
  const fileManager = plugin.fileManager

  try {
    fileManager.copyFile(src, dest)
  } catch (error) {
    console.log('Oops! An error ocurred while performing copyFile operation.' + error)
    dispatch(displayPopUp('Oops! An error ocurred while performing copyFile operation.' + error))
  }
}

export const copyFolder = async (src: string, dest: string) => {
  const fileManager = plugin.fileManager

  try {
    fileManager.copyDir(src, dest)
  } catch (error) {
    console.log('Oops! An error ocurred while performing copyDir operation.' + error)
    dispatch(displayPopUp('Oops! An error ocurred while performing copyDir operation.' + error))
  }
}

export const runScript = async (path: string) => {
  const provider = plugin.fileManager.currentFileProvider()

  provider.get(path, (error, content: string) => {
    if (error) {
      dispatch(displayPopUp(error))
      return console.log(error)
    }
    plugin.call('scriptRunner', 'execute', content)
  })
}

export const emitContextMenuEvent = async (cmd: customAction) => {
  plugin.call(cmd.id, cmd.name, cmd)
}

export const handleClickFile = async (path: string, type: 'file' | 'folder' | 'gist') => {
  plugin.fileManager.open(path)
  dispatch(focusElement([{ key: path, type }]))
}

const createWorkspaceTemplate = async (workspaceName: string, setDefaults = true, template: 'gist-template' | 'code-template' | 'default-template' = 'default-template') => {
  if (!workspaceName) throw new Error('workspace name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName) && template === 'default-template') throw new Error('workspace already exists')
  else {
    const workspaceProvider = plugin.fileProviders.workspace

    await workspaceProvider.createWorkspace(workspaceName)
    if (setDefaults) {
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

            if (!data.files) {
              return dispatch(displayNotification('Gist load error', 'No files found', 'OK', null, () => { dispatch(hideNotification()) }, null))
            }
            const obj = {}

            Object.keys(data.files).forEach((element) => {
              const path = element.replace(/\.\.\./g, '/')

              obj['/' + 'gist-' + gistId + '/' + path] = data.files[element]
            })
            plugin.fileManager.setBatchFiles(obj, 'workspace', true, (errorLoadingFile) => {
              if (!errorLoadingFile) {
                const provider = plugin.fileManager.getProvider('workspace')

                provider.lastLoadedGistId = gistId
              } else {
                dispatch(displayNotification('', errorLoadingFile.message || errorLoadingFile, 'OK', null, () => {}, null))
              }
            })
          } catch (e) {
            dispatch(displayNotification('Gist load error', e.message, 'OK', null, () => { dispatch(hideNotification()) }, null))
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

const renameWorkspaceFromProvider = async (oldName: string, workspaceName: string) => {
  if (!workspaceName) throw new Error('name cannot be empty')
  if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
  if (await workspaceExists(workspaceName)) throw new Error('workspace already exists')
  const browserProvider = plugin.fileProviders.browser
  const workspaceProvider = plugin.fileProviders.workspace
  const workspacesPath = workspaceProvider.workspacesPath
  browserProvider.rename('browser/' + workspacesPath + '/' + oldName, 'browser/' + workspacesPath + '/' + workspaceName, true)
  workspaceProvider.setWorkspace(workspaceName)
  plugin.emit('renameWorkspace', { name: workspaceName })
}

const deleteWorkspaceFromProvider = async (workspaceName: string) => {
  const workspacesPath = plugin.fileProviders.workspace.workspacesPath

  await plugin.fileManager.closeAllFiles()
  plugin.fileProviders.browser.remove(workspacesPath + '/' + workspaceName)
  plugin.emit('deleteWorkspace', { name: workspaceName })
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

    plugin.setWorkspaces(workspaces)
    return workspaces
  } catch (e) {
    dispatch(displayNotification('Workspaces', 'Workspaces have not been created on your system. Please use "Migrate old filesystem to workspace" on the home page to transfer your files or start by creating a new workspace in the File Explorers.', 'OK', null, () => { dispatch(hideNotification()) }, null))
    console.log(e)
  }
}

const packageGistFiles = async (directory) => {
  return new Promise((resolve, reject) => {
    const workspaceProvider = plugin.fileProviders.workspace
    const isFile = workspaceProvider.isFile(directory)
    const ret = {}

    if (isFile) {
      try {
        workspaceProvider.get(directory, (error, content) => {
          if (error) throw new Error('An error ocurred while getting file content. ' + directory)
          if (/^\s+$/.test(content) || !content.length) {
            content = '// this line is added to create a gist. Empty file is not allowed.'
          }
          directory = directory.replace(/\//g, '...')
          ret[directory] = { content }
          return resolve(ret)
        })
      } catch (e) {
        return reject(e)
      }
    } else {
      try {
        (async () => {
          await workspaceProvider.copyFolderToJson(directory, ({ path, content }) => {
            if (/^\s+$/.test(content) || !content.length) {
              content = '// this line is added to create a gist. Empty file is not allowed.'
            }
            if (path.indexOf('gist-') === 0) {
              path = path.split('/')
              path.shift()
              path = path.join('/')
            }
            path = path.replace(/\//g, '...')
            ret[path] = { content }
          })
          resolve(ret)
        })()
      } catch (e) {
        return reject(e)
      }
    }
  })
}

const handleGistResponse = (error, data) => {
  if (error) {
    dispatch(displayNotification('Publish to gist Failed', 'Failed to manage gist: ' + error, 'Close', null))
  } else {
    if (data.html_url) {
      dispatch(displayNotification('Gist is ready', `The gist is at ${data.html_url}. Would you like to open it in a new window?`, 'OK', 'Cancel', () => {
        window.open(data.html_url, '_blank')
      }, () => {}))
    } else {
      const error = JSON.stringify(data.errors, null, '\t') || ''
      const message = data.message === 'Not Found' ? data.message + '. Please make sure the API token has right to create a gist.' : data.message

      dispatch(displayNotification('Publish to gist Failed', message + ' ' + data.documentation_url + ' ' + error, 'Close', null))
    }
  }
}

/**
   * This function is to get the original content of given gist
   * @params id is the gist id to fetch
   */
const getOriginalFiles = async (id) => {
  if (!id) {
    return []
  }

  const url = `https://api.github.com/gists/${id}`
  const res = await fetch(url)
  const data = await res.json()
  return data.files || []
}
