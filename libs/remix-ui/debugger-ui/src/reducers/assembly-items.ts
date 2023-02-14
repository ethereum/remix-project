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
  initialIndex: 0,
  nextIndexes: [-1],
  returnInstructionIndexes: [],
  outOfGasInstructionIndexes: [],
  top: 0,
  bottom: 0,
  isRequesting: false,
  isSuccessful: false,
  hasError: null,
  absoluteCurrentLineIndexes: [],
  currentLineIndexes: [],
  line: -1
}

const reducedOpcode = (opCodes, payload) => {
  const length = 100
  let bottom = opCodes.index - 10
  bottom = bottom < 0 ? 0 : bottom
  const top = bottom + length
  return {
    index: opCodes.index - bottom,
    nextIndexes: opCodes.nextIndexes ? opCodes.nextIndexes.map(index => index - bottom) : [],
    currentLineIndexes: (opCodes.absoluteCurrentLineIndexes && opCodes.absoluteCurrentLineIndexes.map(index => index - bottom)) || [],
    display: opCodes.code.slice(bottom, top),
    returnInstructionIndexes: payload.returnInstructionIndexes.map((index) => index.instructionIndex - bottom),
    outOfGasInstructionIndexes: payload.outOfGasInstructionIndexes.map((index) => index.instructionIndex - bottom)
  }
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
        ...state.opCodes, index: action.payload.index, nextIndexes: action.payload.nextIndexes, absoluteCurrentLineIndexes: state.absoluteCurrentLineIndexes
      } : deepEqual(action.payload.code, state.opCodes.code) ? state.opCodes : action.payload

      const reduced = reducedOpcode(opCodes, action.payload)
      return {
        ...state,
        opCodes,
        display: reduced.display,
        initialIndex: action.payload.index,
        index: reduced.index,
        nextIndexes: reduced.nextIndexes,
        isRequesting: false,
        isSuccessful: true,
        hasError: null,
        returnInstructionIndexes: reduced.returnInstructionIndexes,
        outOfGasInstructionIndexes: reduced.outOfGasInstructionIndexes,
        currentLineIndexes: reduced.currentLineIndexes
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
    case 'FETCH_INDEXES_FOR_NEW_LINE': {
      let bottom = state.initialIndex - 10
      bottom = bottom < 0 ? 0 : bottom
      return {
        ...state,
        absoluteCurrentLineIndexes: action.payload.currentLineIndexes,
        currentLineIndexes: action.payload.currentLineIndexes.map(index => index - bottom),
        line: action.payload.line
      }
    }
    default:
      throw new Error()
  }
}
