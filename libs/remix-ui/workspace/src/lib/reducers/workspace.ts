interface Action {
    type: string
    payload: Record<string, any> | string
}
interface State {
  browser: {
    currentWorkspace: string,
    workspaces: string[],
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  }
}

export const browserInitialState: State = {
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
          currentWorkspace: typeof action.payload === 'string' ? action.payload : '',
          workspaces: typeof action.payload === 'string' ? state.browser.workspaces.includes(action.payload) ? state.browser.workspaces : [...state.browser.workspaces, action.payload] : state.browser.workspaces
        }
      }
    }
    default:
      throw new Error()
  }
}
