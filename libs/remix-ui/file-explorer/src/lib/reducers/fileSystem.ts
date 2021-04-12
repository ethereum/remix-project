import { extractNameFromKey, extractParentFromKey } from '../utils'
interface Action {
    type: string;
    payload: Record<string, any>;
}

export const initialState = {
  files: [],
  expandPath: [],
  isRequesting: false,
  isSuccessful: false,
  hasError: null
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_DIRECTORY_REQUEST': {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        hasError: null
      }
    }
    case 'FETCH_DIRECTORY_SUCCESS': {
      return {
        files: action.payload.files,
        expandPath: [...action.payload.path],
        isRequesting: false,
        isSuccessful: true,
        hasError: null
      }
    }
    case 'FETCH_DIRECTORY_ERROR': {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        hasError: action.payload
      }
    }
    default:
      throw new Error()
  }
}
