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
  readonly: boolean,
  popup: string
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
  readonly: false,
  popup: ''
}

export const browserReducer = (state = browserInitialState, action: Action) => {
  switch (action.type) {
    case 'SET_CURRENT_WORKSPACE': {
      const payload = action.payload as string
      const workspaces = state.browser.workspaces.includes(payload) ? state.browser.workspaces : [...state.browser.workspaces, action.payload]

      return {
        ...state,
        browser: {
          ...state.browser,
          currentWorkspace: payload,
          workspaces: workspaces.filter(workspace => workspace)
        }
      }
    }

    case 'SET_WORKSPACES': {
      const payload = action.payload as string[]

      return {
        ...state,
        browser: {
          ...state.browser,
          workspaces: payload.filter(workspace => workspace)
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

    case 'FETCH_WORKSPACE_DIRECTORY_REQUEST': {
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

    case 'FETCH_WORKSPACE_DIRECTORY_SUCCESS': {
      const payload = action.payload as { path: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchWorkspaceDirectoryContent(state, payload) : state.browser.files,
          isRequesting: false,
          isSuccessful: true,
          error: null
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchWorkspaceDirectoryContent(state, payload) : state.localhost.files,
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }

    case 'FETCH_WORKSPACE_DIRECTORY_ERROR': {
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
      const payload = action.payload as { path: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload) : state.browser.files,
          expandPath: state.mode === 'browser' ? [...new Set([...state.browser.expandPath, payload.path])] : state.browser.expandPath
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload) : state.localhost.files,
          expandPath: state.mode === 'localhost' ? [...new Set([...state.localhost.expandPath, payload.path])] : state.localhost.expandPath
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
          expandPath: state.mode === 'browser' ? [...(state.browser.expandPath.filter(path => path !== payload))] : state.browser.expandPath
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fileRemoved(state, payload) : state.localhost.files,
          expandPath: state.mode === 'localhost' ? [...(state.browser.expandPath.filter(path => path !== payload))] : state.localhost.expandPath
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
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload) : state.browser.files
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload) : state.localhost.files
        }
      }
    }

    case 'REMOVE_INPUT_FIELD': {
      const payload = action.payload as { path: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload, payload.path + '/' + 'blank') : state.browser.files
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload, payload.path + '/' + 'blank') : state.localhost.files
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

    case 'FILE_RENAMED_SUCCESS': {
      const payload = action.payload as { path: string, oldPath: string, fileTree }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: state.mode === 'browser' ? fetchDirectoryContent(state, payload, payload.oldPath) : state.browser.files
        },
        localhost: {
          ...state.localhost,
          files: state.mode === 'localhost' ? fetchDirectoryContent(state, payload, payload.oldPath) : state.localhost.files
        }
      }
    }

    case 'CREATE_WORKSPACE_REQUEST': {
      return {
        ...state,
        browser: {
          ...state.browser,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }

    case 'CREATE_WORKSPACE_SUCCESS': {
      const payload = action.payload as string
      const workspaces = state.browser.workspaces.includes(payload) ? state.browser.workspaces : [...state.browser.workspaces, action.payload]

      return {
        ...state,
        browser: {
          ...state.browser,
          currentWorkspace: payload,
          workspaces: workspaces.filter(workspace => workspace),
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }

    case 'CREATE_WORKSPACE_ERROR': {
      return {
        ...state,
        browser: {
          ...state.browser,
          isRequesting: false,
          isSuccessful: false,
          error: action.payload
        }
      }
    }

    case 'RENAME_WORKSPACE': {
      const payload = action.payload as { oldName: string, workspaceName: string }
      const workspaces = state.browser.workspaces.filter(name => name && (name !== payload.oldName))

      return {
        ...state,
        browser: {
          ...state.browser,
          currentWorkspace: payload.workspaceName,
          workspaces: [...workspaces, payload.workspaceName]
        }
      }
    }

    case 'DELETE_WORKSPACE': {
      const payload = action.payload as string
      const workspaces = state.browser.workspaces.filter(name => name && (name !== payload))

      return {
        ...state,
        browser: {
          ...state.browser,
          workspaces: workspaces
        }
      }
    }

    case 'DISPLAY_POPUP_MESSAGE': {
      const payload = action.payload as string

      return {
        ...state,
        popup: payload
      }
    }

    case 'HIDE_POPUP_MESSAGE': {
      return {
        ...state,
        popup: ''
      }
    }

    default:
      throw new Error()
  }
}

const fileAdded = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  files = _.set(files, _path, {
    path: path,
    name: extractNameFromKey(path),
    isDirectory: false,
    type: 'file'
  })
  return files
}

const fileRemoved = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  const files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  _.unset(files, _path)
  return files
}

// IDEA: Modify function to remove blank input field without fetching content
const fetchDirectoryContent = (state: BrowserState, payload: { fileTree, path: string, type?: 'file' | 'folder' }, deletePath?: string): { [x: string]: Record<string, File> } => {
  if (!payload.fileTree) return state.mode === 'browser' ? state.browser.files : state[state.mode].files
  if (state.mode === 'browser') {
    if (payload.path === state.browser.currentWorkspace) {
      let files = normalize(payload.fileTree, payload.path, payload.type)

      files = _.merge(files, state.browser.files[state.browser.currentWorkspace])
      if (deletePath) delete files[deletePath]
      return { [state.browser.currentWorkspace]: files }
    } else {
      let files = state.browser.files
      const _path = splitPath(state, payload.path)
      const prevFiles = _.get(files, _path)

      if (prevFiles) {
        prevFiles.child = _.merge(normalize(payload.fileTree, payload.path, payload.type), prevFiles.child)
        if (deletePath) delete prevFiles.child[deletePath]
        files = _.set(files, _path, prevFiles)
      } else if (payload.fileTree && payload.path) {
        files = { [payload.path]: normalize(payload.fileTree, payload.path, payload.type) }
      }
      return files
    }
  } else {
    if (payload.path === state.mode || payload.path === '/') {
      let files = normalize(payload.fileTree, payload.path, payload.type)

      files = _.merge(files, state[state.mode].files[state.mode])
      if (deletePath) delete files[deletePath]
      return { [state.mode]: files }
    } else {
      let files = state.localhost.files
      const _path = splitPath(state, payload.path)
      const prevFiles = _.get(files, _path)

      if (prevFiles) {
        prevFiles.child = _.merge(normalize(payload.fileTree, payload.path, payload.type), prevFiles.child)
        if (deletePath) delete prevFiles.child[deletePath]
        files = _.set(files, _path, prevFiles)
      } else {
        files = { [payload.path]: normalize(payload.fileTree, payload.path, payload.type) }
      }
      return files
    }
  }
}

const fetchWorkspaceDirectoryContent = (state: BrowserState, payload: { fileTree, path: string }): { [x: string]: Record<string, File> } => {
  if (state.mode === 'browser') {
    const files = normalize(payload.fileTree, payload.path)

    return { [payload.path]: files }
  } else {
    return fetchDirectoryContent(state, payload)
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

const splitPath = (state: BrowserState, path: string): string[] | string => {
  const root = state.mode === 'browser' ? state.browser.currentWorkspace : 'localhost'
  const pathArr: string[] = (path || '').split('/').filter(value => value)

  if (pathArr[0] !== root) pathArr.unshift(root)
  const _path = pathArr.map((key, index) => index > 1 ? ['child', key] : key).reduce((acc: string[], cur) => {
    return Array.isArray(cur) ? [...acc, ...cur] : [...acc, cur]
  }, [])

  return _path
}
