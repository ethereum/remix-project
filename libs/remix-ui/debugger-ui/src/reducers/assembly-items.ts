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
  nextIndexes: [-1],
  returnInstructionIndexes: [],
  outOfGasInstructionIndexes: [],
  top: 0,
  bottom: 0,
  isRequesting: false,
  isSuccessful: false,
  hasError: null
}

const reducedOpcode = (opCodes, payload) => {
  const length = 100
  let bottom = opCodes.index - 10
  bottom = bottom < 0 ? 0 : bottom
  const top = bottom + length
  return {
    index: opCodes.index - bottom,
    nextIndexes: opCodes.nextIndexes.map(index => index - bottom),
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
        ...state.opCodes, index: action.payload.index, nextIndexes: action.payload.nextIndexes
      } : deepEqual(action.payload.code, state.opCodes.code) ? state.opCodes : action.payload

      const reduced = reducedOpcode(opCodes, action.payload)
      return {
        opCodes,
        display: reduced.display,
        index: reduced.index,
        nextIndexes: reduced.nextIndexes,
        isRequesting: false,
        isSuccessful: true,
        hasError: null,
        returnInstructionIndexes: reduced.returnInstructionIndexes,
        outOfGasInstructionIndexes: reduced.outOfGasInstructionIndexes
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
