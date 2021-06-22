import { default as deepEqual } from 'deep-equal' // eslint-disable-line

interface Action {
    type: string;
    payload: { [key: string]: any };
}

export const initialState = {
  opCodes: {
    code: [],
    index: 0,
    address: ''
  },
  display: [],
  index: 0,
  top: 0,
  bottom: 0,
  isRequesting: false,
  isSuccessful: false,
  hasError: null
}

const reducedOpcode = (opCodes) => {
  const length = 50
  let bottom = opCodes.index - 10
  bottom = bottom < 0 ? 0 : bottom
  const top = bottom + length
  return { top, bottom, display: opCodes.code.slice(bottom, top) }
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_OPCODES_REQUEST': {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        hasError: null
      }
    }
    case 'FETCH_OPCODES_SUCCESS': {
      const opCodes = action.payload.address === state.opCodes.address ? {
        ...state.opCodes, index: action.payload.index
      } : deepEqual(action.payload.code, state.opCodes.code) ? state.opCodes : action.payload

      const reduced = reducedOpcode(opCodes)
      return {
        opCodes,
        display: reduced.display,
        index: reduced.display.findIndex(code => code === opCodes.code[opCodes.index]),
        isRequesting: false,
        isSuccessful: true,
        hasError: null
      }
    }
    case 'FETCH_OPCODES_ERROR': {
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
