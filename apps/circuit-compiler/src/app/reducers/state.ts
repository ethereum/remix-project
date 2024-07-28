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
  compilerFeedback: null,
  computeFeedback: null,
  setupExportFeedback: null,
  provingScheme: 'groth16',
  ptauList: [
    {
      name: "final_14.ptau",
      power: 14,
      maxConstraint: "16k",
      ipfsHash: "QmTiT4eiYz5KF7gQrDsgfCSTRv3wBPYJ4bRN1MmTRshpnW",
      blake2bHash: null
    },
    {
      name: "final_16.ptau",
      power: 16,
      maxConstraint: "64k",
      ipfsHash: "QmciCq5JcZQyTLvC9GRanrLBi82ZmSriq1Fr5zANkGHebf",
      blake2bHash: null
    }],
  ptauValue: "final_14.ptau",
  // randomText: "",
  // randomBeacon: "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20",
  exportVerificationContract: true,
  exportVerificationKey: true
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
      compilerFeedback: action.payload
    }

  case 'SET_COMPUTE_FEEDBACK':
    return {
      ...state,
      computeFeedback: action.payload
    }

  case 'SET_SETUP_EXPORT_FEEDBACK':
    return {
      ...state,
      setupExportFeedback: action.payload
    }

  case 'SET_FILE_PATH_TO_ID':
    return {
      ...state,
      filePathToId: action.payload
    }

  case 'SET_PROVING_SCHEME':
    return {
      ...state,
      provingScheme: action.payload
    }

  case 'SET_PTAU_VALUE':
    return {
      ...state,
      ptauValue: action.payload
    }

    // case 'SET_RANDOM_TEXT':
    //   return {
    //     ...state,
    //     randomText: action.payload
    //   }

    // case 'SET_RANDOM_BEACON':
    //   return {
    //     ...state,
    //     randomBeacon: action.payload
    //   }

  case 'SET_EXPORT_VERIFICATION_CONTRACT':
    return {
      ...state,
      exportVerificationContract: action.payload
    }

  case 'SET_EXPORT_VERIFICATION_KEY':
    return {
      ...state,
      exportVerificationKey: action.payload
    }

  default:
    throw new Error()
  }
}
