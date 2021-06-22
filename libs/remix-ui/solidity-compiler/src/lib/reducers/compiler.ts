interface Action {
  type: string;
  payload: Record<string, any>;
}

export const compilerInitialState = {
  compiler: {
    compiler: null,
    isRequesting: false,
    isSuccessful: false,
    error: null
  }
}

export const compilerReducer = (state = compilerInitialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_COMPILER_REQUEST': {
      return {
        ...state,
        compiler: action.payload,
        isRequesting: true,
        isSuccessful: false,
        error: null
      }
    }
    case 'FETCH_COMPILER_SUCCESS': {
      return {
        ...state,
        provider: {
          ...state,
          compiler: action.payload,
          isRequesting: false,
          isSuccessful: true,
          error: null
        }
      }
    }
    case 'FETCH_COMPILER_ERROR': {
      return {
        ...state,
        provider: {
          ...state,
          isRequesting: false,
          isSuccessful: false,
          error: action.payload
        }
      }
    }
    default:
      throw new Error()
  }
}