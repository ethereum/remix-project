import {Actions, AppState} from '../types'
import { compiler_list } from 'circom_wasm'

export const appInitialState: AppState = {
  version: compiler_list.latest,
  versionList: compiler_list.wasm_builds,
  filePath: "",
  status: "idle",
  primeValue: "bn128",
  autoCompile: false
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

  default:
    throw new Error()
  }
}
