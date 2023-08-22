import {Actions, AppState} from '../types'

export const appInitialState: AppState = {
  isRemixdConnected: null
}

export const appReducer = (state = appInitialState, action: Actions): AppState => {
  switch (action.type) {
  case 'SET_REMIXD_CONNECTION_STATUS':
    return {
      ...state,
      isRemixdConnected: action.payload
    }

  default:
    throw new Error()
  }
}
