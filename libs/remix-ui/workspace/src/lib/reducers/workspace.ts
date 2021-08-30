import { extractNameFromKey, File } from '@remix-ui/file-explorer'
import * as _ from 'lodash'
interface Action {
    type: string
    payload: any
}
export interface BrowserState {
  browser: {
    currentWorkspace: string,
    workspaces: string[],
    files: { [x: string]: Record<string, File> },
    expandPath: string[]
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  localhost: {
    sharedFolder: string,
    files: { [x: string]: Record<string, File> },
    expandPath: string[],
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  mode: 'browser' | 'localhost',
  notification: {
    title: string,
    message: string,
    actionOk: () => void,
    actionCancel: (() => void) | null,
    labelOk: string,
    labelCancel: string
  },
  readonly: boolean
}

export const browserInitialState: BrowserState = {
  browser: {
    currentWorkspace: '',
    workspaces: [],
    files: {},
    expandPath: [],
    isRequesting: false,
    isSuccessful: false,
    error: null
  },
  localhost: {
    sharedFolder: '',
    files: {},
    expandPath: [],
    isRequesting: false,
    isSuccessful: false,
    error: null
  },
  mode: 'browser',
  notification: {
    title: '',
    message: '',
    actionOk: () => {},
    actionCancel: () => {},
    labelOk: '',
    labelCancel: ''
  },
  readonly: false
}

export const browserReducer = (state = browserInitialState, action: Action) => {
  switch (action.type) {
    case 'SET_CURRENT_WORKSPACE': {
      const payload = action.payload as string

      return {
        ...state,
        browser: {
          ...state.browser,
          currentWorkspace: payload,
          workspaces: state.browser.workspaces.includes(payload) ? state.browser.workspaces : [...state.browser.workspaces, action.payload]
        }
      }
    }

    case 'SET_WORKSPACES': {
      const payload = action.payload as string[]

      return {
        ...state,
        browser: {
          ...state.browser,
          workspaces: payload
        }
      }
    }

    case 'SET_MODE': {
      const payload = action.payload as 'browser' | 'localhost'

      return {
        ...state,
        mode: payload
      }
    }

    case 'FETCH_DIRECTORY_REQUEST': {
      return {
        ...state,
        browser: {
          ...state.browser,
          isRequesting: state.mode === 'browser',
          isSuccessful: false,
          error: null
        },
        localhost: {
          ...state.localhost,
          isRequesting: state.mode === 'localhost',
          isSuccessful: false,
          error: null
        }
      }
    }

    case 'FETCH_DIRECTORY_SUCCESS': {
      const payload = action.payload as { path: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload) : state.browser.files,
          isRequesting: false,
          isSuccessful: true,
          error: null
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload) : state.localhost.files,
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }

    case 'FETCH_DIRECTORY_ERROR': {
      return {
        ...state,
        browser: {
          ...state.browser,
          isRequesting: false,
          isSuccessful: false,
          error: state.mode === 'browser' ? action.payload : null
        },
        localhost: {
          ...state.localhost,
          isRequesting: false,
          isSuccessful: false,
          error: state.mode === 'localhost' ? action.payload : null
        }
      }
    }

    case 'DISPLAY_NOTIFICATION': {
      const payload = action.payload as { title: string, message: string, actionOk: () => void, actionCancel: () => void, labelOk: string, labelCancel: string }

      return {
        ...state,
        notification: {
          title: payload.title,
          message: payload.message,
          actionOk: payload.actionOk || browserInitialState.notification.actionOk,
          actionCancel: payload.actionCancel || browserInitialState.notification.actionCancel,
          labelOk: payload.labelOk,
          labelCancel: payload.labelCancel
        }
      }
    }

    case 'HIDE_NOTIFICATION': {
      return {
        ...state,
        notification: browserInitialState.notification
      }
    }

    case 'FILE_ADDED_SUCCESS': {
      const payload = action.payload as string

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fileAdded(state, payload) : state.browser.files,
          expandPath: state.mode === 'browser' ? [...new Set([...state.browser.expandPath, payload])] : state.browser.expandPath
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fileAdded(state, payload) : state.localhost.files,
          expandPath: state.mode === 'localhost' ? [...new Set([...state.localhost.expandPath, payload])] : state.localhost.expandPath
        }
      }
    }

    case 'FOLDER_ADDED_SUCCESS': {
      const payload = action.payload as string

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? folderAdded(state, payload) : state.browser.files,
          expandPath: state.mode === 'browser' ? [...new Set([...state.browser.expandPath, payload])] : state.browser.expandPath
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? folderAdded(state, payload) : state.localhost.files,
          expandPath: state.mode === 'localhost' ? [...new Set([...state.localhost.expandPath, payload])] : state.localhost.expandPath
        }
      }
    }

    case 'FILE_REMOVED_SUCCESS': {
      const payload = action.payload as string

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fileRemoved(state, payload) : state.browser.files,
          expandPath: state.mode === 'browser' ? [...new Set([...state.browser.expandPath, payload])] : state.browser.expandPath
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fileRemoved(state, payload) : state.localhost.files,
          expandPath: state.mode === 'localhost' ? [...new Set([...state.localhost.expandPath, payload])] : state.localhost.expandPath
        }
      }
    }

    case 'ROOT_FOLDER_CHANGED': {
      const payload = action.payload as string

      return {
        ...state,
        localhost: {
          ...state.localhost,
          sharedFolder: payload
        }
      }
    }

    case 'ADD_INPUT_FIELD': {
      const payload = action.payload as { path: string, fileTree, type: 'file' | 'folder' }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload, true) : state.browser.files
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload, true) : state.localhost.files
        }
      }
    }

    case 'REMOVE_INPUT_FIELD': {
      const payload = action.payload as { path: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? removeInputField(state, payload) : state.browser.files
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? removeInputField(state, payload) : state.localhost.files
        }
      }
    }

    case 'SET_READ_ONLY_MODE': {
      const payload = action.payload as boolean

      return {
        ...state,
        readonly: payload
      }
    }

    default:
      throw new Error()
  }
}

const fetchDirectoryContent = (state: BrowserState, payload: { fileTree, path: string, type?: 'file' | 'folder' }) => {
  if (state.mode === 'browser') {
    if (payload.path === state.browser.currentWorkspace) {
      let files = normalize(payload.fileTree, payload.path, payload.type)

      files = _.merge(files, state.browser.files[state.browser.currentWorkspace])
      return { [state.browser.currentWorkspace]: files }
    } else {
      let files = state.browser.files
      const _path = splitPath(state, payload.path)
      const prevFiles = _.get(files, _path)

      prevFiles.child = _.merge(normalize(payload.fileTree, payload.path, payload.type), prevFiles.child)
      files = _.set(files, _path, prevFiles)
      return files
    }
  } else {
    if (payload.path === state.mode) {
      let files = normalize(payload.fileTree, payload.path, payload.type)

      files = _.merge(files, state[state.mode].files[state.mode])
      return { [state.mode]: files }
    } else {
      let files = state.localhost.files
      const _path = splitPath(state, payload.path)
      const prevFiles = _.get(files, _path)

      prevFiles.child = _.merge(normalize(payload.fileTree, payload.path, payload.type), prevFiles.child)
      files = _.set(files, _path, prevFiles)
      return files
    }
  }
}

const normalize = (filesList, directory?: string, newInputType?: 'folder' | 'file'): Record<string, File> => {
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
    const path = directory + '/blank'

    folders[path] = {
      path: path,
      name: '',
      isDirectory: true,
      type: 'folder'
    }
  } else if (newInputType === 'file') {
    const path = directory + '/blank'

    files[path] = {
      path: path,
      name: '',
      isDirectory: false,
      type: 'file'
    }
  }

  return Object.assign({}, folders, files)
}

const fileAdded = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  files = _.set(files, _path, null)
  return files
}

const folderAdded = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  files = _.set(files, _path, null)
  return files
}

const fileRemoved = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  // files = _.unset(files, _path)
  return files
}

const removeInputField = (state: BrowserState, payload: { path: string, fileTree }) => {
  if (state.mode === 'browser') {
    if (payload.path === state.browser.currentWorkspace) {
      const files = state.browser.files

      delete files[state.browser.currentWorkspace][payload.path + '/' + 'blank']
      return files
    }
    return fetchDirectoryContent(state, payload)
  } else {
    if (payload.path === state.mode) {
      const files = state[state.mode].files

      delete files[state.mode][payload.path + '/' + 'blank']
      return files
    }
    return fetchDirectoryContent(state, payload)
  }
}
// IDEA: pass new parameter to fetchDirectoryContent for delete Path option.
const removePath = (state: BrowserState, path: string, pathName, files) => {
  const pathArr: string[] = path.split('/').filter(value => value)

  if (pathArr[0] !== root) pathArr.unshift(root)
  const _path = pathArr.map((key, index) => index > 1 ? ['child', key] : key).reduce((acc: string[], cur) => {
    return Array.isArray(cur) ? [...acc, ...cur] : [...acc, cur]
  }, [])
  const prevFiles = _.get(files, _path)
  if (prevFiles) {
    prevFiles.child && prevFiles.child[pathName] && delete prevFiles.child[pathName]
    files = _.set(files, _path, {
      isDirectory: true,
      path,
      name: extractNameFromKey(path).indexOf('gist-') === 0 ? extractNameFromKey(path).split('-')[1] : extractNameFromKey(path),
      type: extractNameFromKey(path).indexOf('gist-') === 0 ? 'gist' : 'folder',
      child: prevFiles ? prevFiles.child : {}
    })
  }

  return files
}

const splitPath = (state: BrowserState, path: string): string[] | string => {
  const root = state.mode === 'browser' ? state.browser.currentWorkspace : 'localhost'

  const pathArr: string[] = path.split('/').filter(value => value)

  if (pathArr[0] !== root) pathArr.unshift(root)
  const _path = pathArr.map((key, index) => index > 1 ? ['child', key] : key).reduce((acc: string[], cur) => {
    return Array.isArray(cur) ? [...acc, ...cur] : [...acc, cur]
  }, [])

  return _path
}
