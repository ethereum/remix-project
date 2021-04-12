interface Action {
    type: string;
    payload: Record<string, string | number | boolean>;
}

export const initialState = {
  files: [],
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
        files: [],
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
