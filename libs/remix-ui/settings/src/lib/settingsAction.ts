import { textDark, textSecondary } from './constants'

declare global {
  interface Window {
    _paq: any
  }
}

const _paq = window._paq = window._paq || [] //eslint-disable-line

export const generateContractMetadat = (config, checked, dispatch) => {
  config.set('settings/generate-contract-metadata', checked)
  dispatch({ type: 'contractMetadata', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const textWrapEventAction = (config, editor, checked, dispatch) => {
  config.set('settings/text-wrap', checked)
  editor.resize(checked)
  dispatch({ type: 'textWrap', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const personal = (config, checked, dispatch) => {
  config.set('settings/personal-mode', checked)
  dispatch({ type: 'personal', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const copilotActivate = (config, checked, dispatch) => {
  config.set('settings/copilot/suggest/activate', checked)
  dispatch({ type: 'copilot/suggest/activate', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const copilotMaxNewToken = (config, checked, dispatch) => {
  config.set('settings/copilot/suggest/max_new_tokens', checked)
  dispatch({ type: 'copilot/suggest/max_new_tokens', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const copilotTemperature = (config, checked, dispatch) => {
  config.set('settings/copilot/suggest/temperature', checked)
  dispatch({ type: 'copilot/suggest/temperature', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const useMatomoPerfAnalytics = (config, checked, dispatch) => {
  config.set('settings/matomo-perf-analytics', checked)
  localStorage.setItem('matomo-analytics-consent', Date.now().toString())
  dispatch({ type: 'useMatomoPerfAnalytics', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
  if (checked) {
    // user has given consent to process their performance data
    _paq.push(['setCookieConsentGiven'])

  } else {
    // revoke tracking consent for performance data
    _paq.push(['disableCookies'])
  }
}

export const useAutoCompletion = (config, checked, dispatch) => {
  config.set('settings/auto-completion', checked)
  dispatch({ type: 'useAutoCompletion', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const useShowGasInEditor = (config, checked, dispatch) => {
  config.set('settings/show-gas', checked)
  dispatch({ type: 'useShowGasInEditor', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}

export const useDisplayErrors = (config, checked, dispatch) => {
  config.set('settings/display-errors', checked)
  dispatch({ type: 'displayErrors', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
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

export const saveEnvState = (config, checked, dispatch) => {
  config.set('settings/save-evm-state', checked)
  dispatch({ type: 'save-evm-state', payload: { isChecked: checked, textClass: checked ? textDark : textSecondary } })
}
