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
  }
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
  }
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
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }

    case 'FETCH_DIRECTORY_SUCCESS': {
      const payload = action.payload as { path: string, files }

      return {
        ...state,
        browser: {
          ...state.browser,
          files: fetchDirectoryContent(payload.files, payload.path),
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
          error: action.payload
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
          files: fileAdded(state, payload),
          expandPath: [...new Set([...state.browser.expandPath, payload])]
        },
        localhost: {
          ...state.localhost,
          files: fileAdded(state, payload),
          expandPath: [...new Set([...state.localhost.expandPath, payload])]
        }
      }
    }

    case 'FOLDER_ADDED_SUCCESS': {
      const payload = action.payload as string

      return {
        ...state,
        browser: {
          ...state.browser,
          files: folderAdded(state, payload),
          expandPath: [...new Set([...state.browser.expandPath, payload])]
        },
        localhost: {
          ...state.localhost,
          files: folderAdded(state, payload),
          expandPath: [...new Set([...state.localhost.expandPath, payload])]
        }
      }
    }

    default:
      throw new Error()
  }
}

const fetchDirectoryContent = (fileTree, folderPath: string) => {
  const files = normalize(fileTree)

  return { [extractNameFromKey(folderPath)]: files }
}

const normalize = (filesList): Record<string, File> => {
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

  // if (newInputType === 'folder') {
  //   const path = parent + '/blank'

  //   folders[path] = {
  //     path: path,
  //     name: '',
  //     isDirectory: true,
  //     type: 'folder'
  //   }
  // } else if (newInputType === 'file') {
  //   const path = parent + '/blank'

  //   files[path] = {
  //     path: path,
  //     name: '',
  //     isDirectory: false,
  //     type: 'file'
  //   }
  // }

  return Object.assign({}, folders, files)
}

const fileAdded = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  files = _.set(files, _path)
  return files
}

const folderAdded = (state: BrowserState, path: string): { [x: string]: Record<string, File> } => {
  let files = state.mode === 'browser' ? state.browser.files : state.localhost.files
  const _path = splitPath(state, path)

  files = _.set(files, _path)
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
