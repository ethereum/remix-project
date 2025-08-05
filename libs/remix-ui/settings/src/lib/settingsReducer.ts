import { Registry } from '@remix-project/remix-lib'
import { SettingsState } from '../types'

const config = Registry.getInstance().get('config').api
const settingsConfig = Registry.getInstance().get('settingsConfig').api
const defaultTheme = config.get('settings/theme') ? settingsConfig.themes.find((theme) => theme.name.toLowerCase() === config.get('settings/theme').toLowerCase()) : settingsConfig.themes[0]
const defaultLocale = config.get('settings/locale') ? settingsConfig.locales.find((locale) => locale.code === config.get('settings/locale')) : settingsConfig.locales.find((locale) => locale.code === 'en')

export const initialState: SettingsState = {
  'generate-contract-metadata': {
    value: config.get('settings/generate-contract-metadata') || false,
    isLoading: false
  },
  'text-wrap': {
    value: config.get('settings/text-wrap') || false,
    isLoading: false
  },
  'personal-mode': {
    value: config.get('settings/personal-mode') || false,
    isLoading: false
  },
  'matomo-perf-analytics': {
    value: config.get('settings/matomo-perf-analytics') || false,
    isLoading: false
  },
  'matomo-analytics': {
    value: config.get('settings/matomo-analytics') || false,
    isLoading: false
  },
  'auto-completion': {
    value: config.get('settings/auto-completion') || false,
    isLoading: false
  },
  'show-gas': {
    value: config.get('settings/show-gas') || false,
    isLoading: false
  },
  'display-errors': {
    value: config.get('settings/display-errors') || false,
    isLoading: false
  },
  'copilot/suggest/activate': {
    value: config.get('settings/copilot/suggest/activate') || false,
    isLoading: false
  },
  'copilot/suggest/max_new_tokens': {
    value: config.get('settings/copilot/suggest/max_new_tokens') || 5,
    isLoading: false
  },
  'copilot/suggest/temperature': {
    value: config.get('settings/copilot/suggest/temperature') || 0.5,
    isLoading: false
  },
  'save-evm-state': {
    value: config.get('settings/save-evm-state') || false,
    isLoading: false
  },
  'theme': {
    value: defaultTheme.name,
    isLoading: false
  },
  'locale': {
    value: defaultLocale.localeName,
    isLoading: false
  }
}

export const settingReducer = (state: SettingsState, action: { type: string, payload: { name: string, value?: boolean } }) => {
  switch (action.type) {
  case 'SET_VALUE':
    if (action.payload.name === 'theme') {
      const theme = settingsConfig.themes.find((theme) => theme.name === action.payload.value)

      if (theme) {
        const themeModule = Registry.getInstance().get('themeModule').api

        themeModule.switchTheme(theme.name)
        return { ...state, [action.payload.name]: { ...state[action.payload.name], value: theme.name, isLoading: false } }
      } else {
        console.error('Theme not found: ', action.payload.value)
        return state
      }
    } else if (action.payload.name === 'locale') {
      const locale = settingsConfig.locales.find((locale) => locale.code === action.payload.value)
      if (locale) {
        const localeModule = Registry.getInstance().get('localeModule').api

        localeModule.switchLocale(locale.code)
        return { ...state, [action.payload.name]: { ...state[action.payload.name], value: locale.localeName, isLoading: false } }
      } else {
        console.error('Locale not found: ', action.payload.value)
        return state
      }
    }
    config.set('settings/' + action.payload.name, action.payload.value)
    return { ...state, [action.payload.name]: { ...state[action.payload.name], value: action.payload.value, isLoading: false } }
  case 'SET_LOADING':
    return { ...state, [action.payload.name]: { ...state[action.payload.name], isLoading: true } }
  default:
    return state
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
