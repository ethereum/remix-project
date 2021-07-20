interface Action {
    type: string
    payload: Record<string, any> | string
}

export const browserInitialState = {
  browser: {
    currentWorkspace: '',
    workspaces: [],
    isRequesting: false,
    isSuccessful: false,
    error: null
  }
}

export const browserReducer = (state = browserInitialState, action: Action) => {
  switch (action.type) {
    case 'SET_CURRENT_WORKSPACE': {
      return {
        ...state,
        browser: {
          ...state.browser,
          currentWorkspace: typeof action.payload === 'string' ? action.payload : ''
        }
      }
    }
    default:
      throw new Error()
  }
}
