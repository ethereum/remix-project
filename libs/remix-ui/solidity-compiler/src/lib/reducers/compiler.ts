interface Action {
  type: string;
  payload: Record<string, any>;
}

export const compilerInitialState = {
  compiler: {
    mode: '',
    args: null
  },
  editor: {
    mode: ''
  }
}

export const compilerReducer = (state = compilerInitialState, action: Action) => {
  switch (action.type) {
    case 'SET_COMPILER_MODE': {
      return {
        ...state,
        compiler: {
          ...state.compiler,
          mode: action.payload.mode,
          args: action.payload.args || null
        }
      }
    }

    case 'RESET_COMPILER_MODE': {
      return {
        ...state,
        compiler: {
          ...state.compiler,
          mode: '',
          args: null
        }
      }
    }

    case 'SET_EDITOR_MODE': {
      return {
        ...state,
        editor: {
          ...state.editor,
          mode: action.payload
        }
      }
    }

    case 'RESET_EDITOR_MODE': {
      return {
        ...state,
        editor: {
          ...state.editor,
          mode: ''
        }
      }
    }

    default:
      throw new Error()
  }
}
