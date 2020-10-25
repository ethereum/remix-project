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
    top: 0,
    bottom: 0,
    isRequesting: false,
    isSuccessful: false,
    hasError: null
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_OPCODES_REQUEST': {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        hasError: null
      };
    }
    case 'FETCH_OPCODES_SUCCESS': {
      const opCodes = action.payload.address === state.opCodes.address ? { 
        ...state.opCodes, index: action.payload.index 
      } : deepEqual(action.payload.code, state.opCodes.code) ? state.opCodes : action.payload
      const top = opCodes.index - 10 > 0 ? opCodes.index - 10 : 0
      const bottom = opCodes.index + 10 < opCodes.code.length ? opCodes.index + 10 : opCodes.code.length
      const display =  opCodes.code.slice(top, bottom)

      return {
          opCodes,
          display,
          index: display.findIndex(code => code === opCodes.code[opCodes.index]),
          top,
          bottom,
          isRequesting: false,
          isSuccessful: true,
          hasError: null
      };
    }
    case 'FETCH_OPCODES_ERROR': {
      return {
          ...state,
          isRequesting: false,
          isSuccessful: false,
          hasError: action.payload
      };
    }
    // case 'FETCH_PREV_OPCODES': {
    //   const top = state.top - 10 > 0 ? state.top - 10 : 0
    //   const display =  state.opCodes.code.slice(top, state.bottom)

    //   return {
    //     ...state,
    //       display,
    //       index: display.findIndex(code => code === state.opCodes.code[state.opCodes.index]),
    //       top,
    //       isRequesting: false,
    //       isSuccessful: true,
    //       hasError: null
    //   };
    // }
    default:
      throw new Error();
  }
}