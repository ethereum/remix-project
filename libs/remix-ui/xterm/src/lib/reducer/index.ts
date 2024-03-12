import { Actions, xTerminalUiState } from "@remix-ui/xterm"

export const xTerminInitialState: xTerminalUiState = {
  terminalsEnabled: false,
  terminals: [],
  shells: [],
  showOutput: true,
  workingDir: ''
}

export const xtermReducer = (state = xTerminInitialState, action: Actions) => {
  switch (action.type) {
  case 'ENABLE_TERMINALS':
    return {
      ...state,
      terminalsEnabled: true
    }
  case 'DISABLE_TERMINALS':
    return {
      ...state,
      terminalsEnabled: false
    }
  case 'ADD_TERMINAL':
    return {
      ...state,
      terminals: [...state.terminals, action.payload]
    }
  case 'HIDE_TERMINAL':
    return {
      ...state,
      terminals: state.terminals.map(terminal => terminal.pid === action.payload ? { ...terminal, hidden: true } : terminal)
    }
  case 'SHOW_TERMINAL':
    return {
      ...state,
      terminals: state.terminals.map(terminal => terminal.pid === action.payload ? { ...terminal, hidden: false } : terminal)
    }
  case 'HIDE_ALL_TERMINALS':
    return {
      ...state,
      terminals: state.terminals.map(terminal => ({ ...terminal, hidden: true }))
    }
  case 'REMOVE_TERMINAL': {
    const removed = state.terminals.filter(xtermState => xtermState.pid !== action.payload)
    if (removed.length > 0)
      removed[removed.length - 1].hidden = false
    return {
      ...state,
      terminals: removed
    }
  }
  case 'ADD_SHELLS':
    return {
      ...state,
      shells: action.payload
    }
  case 'SHOW_OUTPUT':
    return {
      ...state,
      showOutput: action.payload
    }
  case 'SET_WORKING_DIR':
    return {
      ...state,
      workingDir: action.payload
    }
  default:
    return state
  }
}
