import { textDark, textSecondary } from './constants'

declare global {
  interface Window {
    _paq: any
  }
}

const _paq = window._paq = window._paq || [] //eslint-disable-line

export const generateContractMetadat = (element, event, dispatch) => {
  element.config.set('settings/generate-contract-metadata', !event.target.checked)
  dispatch({ type: 'contractMetadata', payload: { name: event.target.name, isChecked: event.target.checked, textClass: event.target.checked ? textDark : textSecondary } })
}

export const etherumVM = (element, event, dispatch) => {
  element.config.set('settings/always-use-vm', !event.target.checked)
  dispatch({ type: 'ethereumVM', payload: { name: event.target.name, isChecked: event.target.checked, textClass: event.target.checked ? textDark : textSecondary } })
}

export const textWrapEventAction = (element, event, dispatch) => {
  console.log({ element })
  element.config.set('settings/text-wrap', !event.target.checked)
  element.editor.resize(!event.target.checked)
  dispatch({ type: 'textWrap', payload: { name: event.target.name, isChecked: event.target.checked, textClass: event.target.checked ? textDark : textSecondary } })
}

export const personal = (element, event, dispatch) => {
  element.config.set('settings/personal-mode', !event.target.checked)
  dispatch({ type: 'personal', payload: { name: event.target.name, isChecked: event.target.checked, textClass: event.target.checked ? textDark : textSecondary } })
}

export const useMatomoAnalytics = (element, event, dispatch) => {
  element.config.set('settings/matomo-analytics', !event.target.checked)
  dispatch({ type: 'useMatomoAnalytics', payload: { name: event.target.name, isChecked: event.target.checked, textClass: event.target.checked ? textDark : textSecondary } })
  if (event.target.checked) {
    _paq.push(['forgetUserOptOut'])
    // @TODO remove next line when https://github.com/matomo-org/matomo/commit/9e10a150585522ca30ecdd275007a882a70c6df5 is used
    document.cookie = 'mtm_consent_removed=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  } else {
    _paq.push(['optUserOut'])
  }
}
