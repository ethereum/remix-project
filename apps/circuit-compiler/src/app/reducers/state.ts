import { Actions, AppState } from '../types'
import { compiler_list } from 'circom_wasm'

export const appInitialState: AppState = {
  version: compiler_list.latest,
  versionList: compiler_list.wasm_builds,
  filePath: "",
  filePathToId: {},
  status: "idle",
  primeValue: "bn128",
  autoCompile: false,
  hideWarnings: false,
  signalInputs: [],
  feedback: null
}

export const appReducer = (state = appInitialState, action: Actions): AppState => {
  switch (action.type) {

  case 'SET_COMPILER_VERSION':
    return {
      ...state,
      version: action.payload
    }

  case 'SET_FILE_PATH':
    return {
      ...state,
      filePath: action.payload
    }

  case 'SET_COMPILER_STATUS':
    return {
      ...state,
      status: action.payload
    }

  case 'SET_PRIME_VALUE':
    return {
      ...state,
      primeValue: action.payload
    }

  case 'SET_AUTO_COMPILE':
    return {
      ...state,
      autoCompile: action.payload
    }

  case 'SET_HIDE_WARNINGS':
    return {
      ...state,
      hideWarnings: action.payload
    }

  case 'SET_SIGNAL_INPUTS':
    return {
      ...state,
      signalInputs: action.payload
    }

  case 'SET_COMPILER_FEEDBACK':
    return {
      ...state,
      feedback: action.payload
    }

  case 'SET_FILE_PATH_TO_ID':
    return {
      ...state,
      filePathToId: action.payload
    }

  default:
    throw new Error()
  }
}
