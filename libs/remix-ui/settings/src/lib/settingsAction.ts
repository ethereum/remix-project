import { textDark, textSecondary } from './constants'

declare global {
  interface Window {
    _paq: any
  }
}

const _paq = window._paq = window._paq || [] //eslint-disable-line

export const generateContractMetadat = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'generate-contract-metadata', value: checked } })
}

export const textWrapEventAction = ( editor, checked, dispatch) => {
  editor.resize(checked)
  dispatch({ type: 'SET_VALUE', payload: { name: 'text-wrap', value: checked } })
}

export const personal = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'personal-mode', value: checked } })
}

export const copilotActivate = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'copilot/suggest/activate', value: checked } })
}

export const copilotMaxNewToken = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'copilot/suggest/max_new_tokens', value: checked } })
}

export const copilotTemperature = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'copilot/suggest/temperature', value: checked } })
}

export const useMatomoPerfAnalytics = (checked, dispatch) => {
  localStorage.setItem('matomo-analytics-consent', Date.now().toString())
  dispatch({ type: 'SET_VALUE', payload: { name: 'matomo-perf-analytics', value: checked } })
  if (checked) {
    // user has given consent to process their performance data
    _paq.push(['setCookieConsentGiven'])

  } else {
    // revoke tracking consent for performance data
    _paq.push(['disableCookies'])
  }
}

export const useAutoCompletion = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'auto-completion', value: checked } })
}

export const useShowGasInEditor = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'show-gas', value: checked } })
}

export const useDisplayErrors = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'display-errors', value: checked } })
}

export const saveTokenToast = (config, dispatch, tokenValue, key) => {
  config.set('settings/' + key, tokenValue)
  dispatch({ type: 'save', payload: { message: 'Credentials updated' } })
}

export const removeTokenToast = (config, dispatch, key) => {
  config.set('settings/' + key, '')
  dispatch({ type: 'removed', payload: { message: 'Credentials removed' } })
}

export const saveSwarmSettingsToast = (config, dispatch, privateBeeAddress, postageStampId) => {
  config.set('settings/swarm-private-bee-address', privateBeeAddress)
  config.set('settings/swarm-postage-stamp-id', postageStampId)
  dispatch({ type: 'save', payload: { message: 'Swarm settings have been saved' } })
}

export const saveIpfsSettingsToast = (config, dispatch, ipfsURL, ipfsProtocol, ipfsPort, ipfsProjectId, ipfsProjectSecret) => {
  config.set('settings/ipfs-url', ipfsURL)
  config.set('settings/ipfs-protocol', ipfsProtocol)
  config.set('settings/ipfs-port', ipfsPort)
  config.set('settings/ipfs-project-id', ipfsProjectId)
  config.set('settings/ipfs-project-secret', ipfsProjectSecret)
  dispatch({ type: 'save', payload: { message: 'IPFS settings have been saved' } })
}

export const saveEnvState = (checked, dispatch) => {
  dispatch({ type: 'SET_VALUE', payload: { name: 'save-evm-state', value: checked } })
}
