import { File } from '../types'
interface Action {
    type: string;
    payload: Record<string, any>;
}

export const fileSystemInitialState = {
  files: {
    files: [],
    activeDirectory: {},
    expandPath: [],
    isRequesting: false,
    isSuccessful: false,
    error: null
  },
  provider: {
    provider: null,
    isRequesting: false,
    isSuccessful: false,
    error: null
  }
}

export const fileSystemReducer = (state = fileSystemInitialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_DIRECTORY_REQUEST': {
      return {
        ...state,
        files: {
          ...state.files,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }
    case 'FETCH_DIRECTORY_SUCCESS': {
      return {
        ...state,
        files: {
          ...state.files,
          files: action.payload.files,
          expandPath: [...state.files.expandPath, action.payload.path],
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }
    case 'FETCH_DIRECTORY_ERROR': {
      return {
        ...state,
        files: {
          ...state.files,
          isRequesting: false,
          isSuccessful: false,
          error: action.payload
        }
      }
    }
    case 'RESOLVE_DIRECTORY_REQUEST': {
      return {
        ...state,
        files: {
          ...state.files,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }
    case 'RESOLVE_DIRECTORY_SUCCESS': {
      return {
        ...state,
        files: {
          ...state.files,
          files: action.payload.files,
          expandPath: [...state.files.expandPath, action.payload.path],
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }
    case 'RESOLVE_DIRECTORY_ERROR': {
      return {
        ...state,
        files: {
          ...state.files,
          isRequesting: false,
          isSuccessful: false,
          error: action.payload
        }
      }
    }
    case 'FETCH_PROVIDER_REQUEST': {
      return {
        ...state,
        provider: {
          ...state.provider,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }
    case 'FETCH_PROVIDER_SUCCESS': {
      return {
        ...state,
        provider: {
          ...state.provider,
          provider: action.payload,
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }
    case 'FETCH_PROVIDER_ERROR': {
      return {
        ...state,
        provider: {
          ...state.provider,
          isRequesting: false,
          isSuccessful: false,
          error: action.payload
        }
      }
    }
    case 'ADD_EMPTY_FILE': {
      return {
        ...state,
        files: {
          ...state.files,
          files: []
        }
      }
    }
    default:
      throw new Error()
  }
}

const addEmptyFile = (path: string, files: File[]): File[] => {
  if (path === name) {
    files.push({
      path: 'browser/blank',
      name: '',
      isDirectory: false
    })
    return files
  }
  return files.map(file => {
    if (file.child) {
      if (file.path === path) {
        file.child = [...file.child, {
          path: file.path + '/blank',
          name: '',
          isDirectory: false
        }]
        return file
      } else {
        file.child = addEmptyFile(path, file.child)

        return file
      }
    } else {
      return file
    }
  })
}
