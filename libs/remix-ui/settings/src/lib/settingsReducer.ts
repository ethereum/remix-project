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
      name: 'useMatomoAnalytics',
      isChecked: false,
      textClass: textSecondary
    }
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
    case 'useMatomoAnalytics':
      state.elementState.map(element => {
        if (element.name === 'useMatomoAnalytics') {
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
