import { default as deepEqual } from 'deep-equal'

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
    isRequesting: false,
    isSuccessful: false,
    hasError: null
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_OPCODES_REQUEST':
      return {
          ...state,
          isRequesting: true,
          isSuccessful: false,
          hasError: null
      };
    case 'FETCH_OPCODES_SUCCESS': 
      const opCodes = action.payload.address === state.opCodes.address ? { 
        ...state.opCodes, index: action.payload.index 
      } : deepEqual(action.payload.code, state.opCodes.code) ? state.opCodes : action.payload
      const display = opCodes.index > 0 ? opCodes.code.slice(opCodes.index - 1, opCodes.index + 10) : opCodes.code.slice(opCodes.index, opCodes.index + 10)

      return {
          opCodes,
          display,
          index: display.findIndex(code => code === opCodes.code[opCodes.index]),
          isRequesting: false,
          isSuccessful: true,
          hasError: null
      };
    case 'FETCH_OPCODES_ERROR':
        return {
            ...state,
            isRequesting: false,
            isSuccessful: false,
            hasError: action.payload
        };
    default:
      throw new Error();
  }
}