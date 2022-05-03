import React from 'react'
import { extractNameFromKey, createNonClashingNameAsync } from '@remix-ui/helper'
import Gists from 'gists'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel/type'
import { displayNotification, displayPopUp, fetchDirectoryError, fetchDirectoryRequest, fetchDirectorySuccess, focusElement, fsInitializationCompleted, hidePopUp, removeInputFieldSuccess, setCurrentWorkspace, setExpandPath, setMode, setWorkspaces } from './payload'
import { listenOnPluginEvents, listenOnProviderEvents } from './events'
import { createWorkspaceTemplate, getWorkspaces, loadWorkspacePreset, setPlugin } from './workspace'
import { QueryParams } from '@remix-project/remix-lib'
import JSZip from 'jszip'

export * from './events'
export * from './workspace'

const queryParams = new QueryParams()
const _paq = window._paq = window._paq || []

let plugin, dispatch: React.Dispatch<any>

export type UrlParametersType = {
  gist: string,
  code: string,
  url: string
}

export const initWorkspace = (filePanelPlugin) => async (reducerDispatch: React.Dispatch<any>) => {
  if (filePanelPlugin) {
    plugin = filePanelPlugin
    dispatch = reducerDispatch
    setPlugin(plugin, dispatch)
    const workspaceProvider = filePanelPlugin.fileProviders.workspace
    const localhostProvider = filePanelPlugin.fileProviders.localhost
    const params = queryParams.get() as UrlParametersType
    const workspaces = await getWorkspaces() || []

    dispatch(setWorkspaces(workspaces))
    if (params.gist) {
      await createWorkspaceTemplate('gist-sample', 'gist-template')
      plugin.setWorkspace({ name: 'gist-sample', isLocalhost: false })
      dispatch(setCurrentWorkspace('gist-sample'))
      await loadWorkspacePreset('gist-template')
    } else if (params.code || params.url) {
      await createWorkspaceTemplate('code-sample', 'code-template')
      plugin.setWorkspace({ name: 'code-sample', isLocalhost: false })
      dispatch(setCurrentWorkspace('code-sample'))
      const filePath = await loadWorkspacePreset('code-template')
      plugin.on('editor', 'editorMounted', async () => await plugin.fileManager.openFile(filePath))
    } else {
      if (workspaces.length === 0) {
        await createWorkspaceTemplate('default_workspace', 'remixDefault')
        plugin.setWorkspace({ name: 'default_workspace', isLocalhost: false })
        dispatch(setCurrentWorkspace('default_workspace'))
        await loadWorkspacePreset('remixDefault')
      } else {
        if (workspaces.length > 0) {
          workspaceProvider.setWorkspace(workspaces[workspaces.length - 1])
          plugin.setWorkspace({ name: workspaces[workspaces.length - 1], isLocalhost: false })
          dispatch(setCurrentWorkspace(workspaces[workspaces.length - 1]))
        }
      }
    }

    listenOnPluginEvents(plugin)
    listenOnProviderEvents(workspaceProvider)(dispatch)
    listenOnProviderEvents(localhostProvider)(dispatch)
    dispatch(setMode('browser'))
    plugin.setWorkspaces(await getWorkspaces())
    dispatch(fsInitializationCompleted())
    plugin.emit('workspaceInitializationCompleted')
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

export const removeInputField = async (path: string) => {
  dispatch(removeInputFieldSuccess(path))
}

export type SolidityConfiguration = {
  version: string,
  optimize: string,
  runs: string
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
      const params = queryParams.get() as SolidityConfiguration
      const description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' +
      params.version + '&optimize=' + params.optimize + '&runs=' + params.runs + '&gist='
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
    return dispatch(displayNotification('Failed to create folder', `A folder ${extractNameFromKey(path)} already exists at this location. Please choose a different name.`, 'Close', null, () => {}))
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
    await fileManager.copyFile(src, dest)
  } catch (error) {
    dispatch(displayPopUp('Oops! An error ocurred while performing copyFile operation.' + error))
  }
}

export const copyFolder = async (src: string, dest: string) => {
  const fileManager = plugin.fileManager

  try {
    await fileManager.copyDir(src, dest)
  } catch (error) {
    dispatch(displayPopUp('Oops! An error ocurred while performing copyDir operation.' + error))
  }
}

export const runScript = async (path: string) => {
  const provider = plugin.fileManager.currentFileProvider()

  provider.get(path, (error, content: string) => {
    if (error) {
      return dispatch(displayPopUp(error))
    }
    plugin.call('scriptRunner', 'execute', content, path)
  })
}

export const emitContextMenuEvent = async (cmd: customAction) => {
  await plugin.call(cmd.id, cmd.name, cmd)
}

export const handleClickFile = async (path: string, type: 'file' | 'folder' | 'gist') => {
  await plugin.fileManager.open(path)
  dispatch(focusElement([{ key: path, type }]))
}

export const handleExpandPath = (paths: string[]) => {
  dispatch(setExpandPath(paths))
}

export const handleDownloadFiles = async () => {
  try {
    plugin.call('notification', 'toast', 'preparing files for download, please wait..')
    const zip = new JSZip()

    zip.file("readme.txt", "This is a Remix backup file.\nThis zip should be used by the restore backup tool in Remix.\nThe .workspaces directory contains your workspaces.")
    const browserProvider = plugin.fileManager.getProvider('browser')

    await browserProvider.copyFolderToJson('/', ({ path, content }) => {
      zip.file(path, content)
    })
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      const today = new Date()
      const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
      const time = today.getHours() + 'h' + today.getMinutes() + 'min'

      saveAs(blob, `remix-backup-at-${time}-${date}.zip`)
      _paq.push(['trackEvent', 'Backup', 'download', 'home'])
    }).catch((e) => {
      _paq.push(['trackEvent', 'Backup', 'error', e.message])
      plugin.call('notification', 'toast', e.message)
    })
  } catch (e) {
    plugin.call('notification', 'toast', e.message)
  }
}

export const restoreBackupZip = async () => {
  await plugin.appManager.activatePlugin(['restorebackupzip'])
  await plugin.call('mainPanel', 'showContent', 'restorebackupzip')
  _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'restorebackupzip'])
}

const packageGistFiles = async (directory) => {
  const workspaceProvider = plugin.fileProviders.workspace
  const isFile = await workspaceProvider.isFile(directory)
  return new Promise((resolve, reject) => {
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

const saveAs = (blob, name) => {
  const node = document.createElement('a')

  node.download = name
  node.rel = 'noopener'
  node.href = URL.createObjectURL(blob)
  setTimeout(function () { URL.revokeObjectURL(node.href) }, 4E4) // 40s
  setTimeout(function () {
    try {
      node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
      const evt = document.createEvent('MouseEvents')

      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
        20, false, false, false, false, 0, null)
      node.dispatchEvent(evt)
    }
  }, 0) // 40s
}
