import { Registry } from '@remix-project/remix-lib'
import { SettingsActions, SettingsState } from '../types'

const config = Registry.getInstance().get('config').api
const settingsConfig = Registry.getInstance().get('settingsConfig').api
const defaultTheme = config.get('settings/theme') ? settingsConfig.themes.find((theme) => theme.name.toLowerCase() === config.get('settings/theme').toLowerCase()) : settingsConfig.themes[0]
const defaultLocale = config.get('settings/locale') ? settingsConfig.locales.find((locale) => locale.code === config.get('settings/locale')) : settingsConfig.locales.find((locale) => locale.code === 'en')
const gistAccessToken = config.get('settings/gist-access-token') || ''
const githubUserName = config.get('settings/github-user-name') || ''
const githubEmail = config.get('settings/github-email') || ''
const ipfsUrl = config.get('settings/ipfs-url') || ''
const ipfsProtocol = config.get('settings/ipfs-protocol') || ''
const ipfsPort = config.get('settings/ipfs-port') || ''
const ipfsProjectId = config.get('settings/ipfs-project-id') || ''
const ipfsProjectSecret = config.get('settings/ipfs-project-secret') || ''
const swarmPrivateBeeAddress = config.get('settings/swarm-private-bee-address') || ''
const swarmPostageStampId = config.get('settings/swarm-postage-stamp-id') || ''
const sindriAccessToken = config.get('settings/sindri-access-token') || ''
const etherscanAccessToken = config.get('settings/etherscan-access-token') || ''

let githubConfig = config.get('settings/github-config') || false
let ipfsConfig = config.get('settings/ipfs-config') || false
let swarmConfig = config.get('settings/swarm-config') || false
let sindriConfig = config.get('settings/sindri-config') || false
let etherscanConfig = config.get('settings/etherscan-config') || false

if (!githubConfig && (githubUserName || githubEmail || gistAccessToken)) {
  config.set('settings/github-config', true)
  githubConfig = true
}
if (!ipfsConfig && (ipfsUrl || ipfsProtocol || ipfsPort || ipfsProjectId || ipfsProjectSecret)) {
  config.set('settings/ipfs-config', true)
  ipfsConfig = true
}
if (!swarmConfig && (swarmPrivateBeeAddress || swarmPostageStampId)) {
  config.set('settings/swarm-config', true)
  swarmConfig = true
}
if (!sindriConfig && sindriAccessToken) {
  config.set('settings/sindri-config', true)
  sindriConfig = true
}
if (!etherscanConfig && etherscanAccessToken) {
  config.set('settings/etherscan-config', true)
  etherscanConfig = true
}

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
  },
  'github-config': {
    value: githubConfig,
    isLoading: false
  },
  'ipfs-config': {
    value: ipfsConfig,
    isLoading: false
  },
  'swarm-config': {
    value: swarmConfig,
    isLoading: false
  },
  'sindri-config': {
    value: sindriConfig,
    isLoading: false
  },
  'etherscan-config': {
    value: etherscanConfig,
    isLoading: false
  },
  'gist-access-token': {
    value: gistAccessToken,
    isLoading: false
  },
  'github-user-name': {
    value: githubUserName,
    isLoading: false
  },
  'github-email': {
    value: githubEmail,
    isLoading: false
  },
  'ipfs-url': {
    value: ipfsUrl,
    isLoading: false
  },
  'ipfs-protocol': {
    value: ipfsProtocol,
    isLoading: false
  },
  'ipfs-port': {
    value: ipfsPort,
    isLoading: false
  },
  'ipfs-project-id': {
    value: ipfsProjectId,
    isLoading: false
  },
  'ipfs-project-secret': {
    value: ipfsProjectSecret,
    isLoading: false
  },
  'swarm-private-bee-address': {
    value: swarmPrivateBeeAddress,
    isLoading: false
  },
  'swarm-postage-stamp-id': {
    value: swarmPostageStampId,
    isLoading: false
  },
  'sindri-access-token': {
    value: sindriAccessToken,
    isLoading: false
  },
  'etherscan-access-token': {
    value: etherscanAccessToken,
    isLoading: false
  },
  'ai-privacy-policy': {
    value: '',
    isLoading: false
  },
  toaster: {
    value: '',
    isLoading: false
  }
}

export const settingReducer = (state: SettingsState, action: SettingsActions): SettingsState => {
  switch (action.type) {
  case 'SET_VALUE':
    config.set('settings/' + action.payload.name, action.payload.value)
    return { ...state, [action.payload.name]: { ...state[action.payload.name], value: action.payload.value, isLoading: false } }
  case 'SET_LOADING':
    return { ...state, [action.payload.name]: { ...state[action.payload.name], isLoading: true } }

  case 'SET_TOAST_MESSAGE':
    return { ...state, toaster: { ...state.toaster, value: action.payload.value, isLoading: false } }
  default:
    return state
  }
}
