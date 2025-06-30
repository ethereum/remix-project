import { textSecondary } from './constants'

export const initialState = {
  elementState: [
    {
      name: 'contractMetadata',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'ethereumVM',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'textWrap',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'personal',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'useMatomoPerfAnalytics',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'useAutoCompletion',
      isChecked: true,
      textClass: textSecondary
    },
    {
      name: 'useShowGasInEditor',
      isChecked: true,
      textClass: textSecondary
    },
    {
      name: 'displayErrors',
      isChecked: true,
      textClass: textSecondary
    },
    {
      name: 'copilot/suggest/activate',
      isChecked: false,
      textClass: textSecondary
    },
    {
      name: 'copilot/suggest/max_new_tokens',
      value: 5,
      textClass: textSecondary
    },
    {
      name: 'copilot/suggest/temperature',
      value: 0.5,
      textClass: textSecondary
    },
    {
      name: 'save-evm-state',
      isChecked: false,
      textClass: textSecondary
    },
  ]
}

export const settingReducer = (state, action) => {
  switch (action.type) {
  case 'contractMetadata':
    state.elementState.map(element => {
      if (element.name === 'contractMetadata') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'ethereumVM':
    state.elementState.map(element => {
      if (element.name === 'ethereumVM') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'textWrap':
    state.elementState.map(element => {
      if (element.name === 'textWrap') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'personal':
    state.elementState.map(element => {
      if (element.name === 'personal') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'useMatomoPerfAnalytics':
    state.elementState.map(element => {
      if (element.name === 'useMatomoPerfAnalytics') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }

  case 'useAutoCompletion':
    state.elementState.map(element => {
      if (element.name === 'useAutoCompletion') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'displayErrors':
    state.elementState.map(element => {
      if (element.name === 'displayErrors') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'useShowGasInEditor':
    state.elementState.map(element => {
      if (element.name === 'useShowGasInEditor') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'copilot/suggest/activate':
    state.elementState.map(element => {
      if (element.name === 'copilot/suggest/activate') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'copilot/suggest/max_new_tokens':
    state.elementState.map(element => {
      if (element.name === 'copilot/suggest/max_new_tokens') {
        element.value = action.payload.value
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  case 'copilot/suggest/temperature':
    state.elementState.map(element => {
      if (element.name === 'useShowGasInEditor') {
        element.value = action.payload.value
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }

  case 'save-evm-state':
    state.elementState.map(element => {
      if (element.name === 'save-evm-state') {
        element.isChecked = action.payload.isChecked
        element.textClass = action.payload.textClass
      }
    })
    return {
      ...state
    }
  default:
    return initialState
  }

}

export const toastInitialState = {
  message: ''
}

export const toastReducer = (state, action) => {
  switch (action.type) {
  case 'save' :
    return { ...state, message: action.payload.message }
  case 'removed' :
    return { ...state, message: action.payload.message }
  default :
    return { ...state, message: '' }
  }
}
