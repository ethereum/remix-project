import React, { useState, useReducer, useEffect } from 'react' // eslint-disable-line
import { CopyToClipboard } from '@remix-ui/clipboard' // eslint-disable-line

import { generateContractMetadataText, warnText } from './constants'

import './remix-ui-settings.css'
import { etherumVM, generateContractMetadat, personal, textWrapEventAction, useMatomoAnalytics } from './settingsAction'
import { initialState, settingReducer } from './settingsReducer'
import { Toaster } from '@remix-ui/toaster'// eslint-disable-line

/* eslint-disable-next-line */
export interface RemixUiSettingsProps {
  config: any,
  editor: any,
   _deps: any
}

export const RemixUiSettings = (props: RemixUiSettingsProps) => {
  const [state, dispatch] = useReducer(settingReducer, initialState)
  const [tokenValue, setTokenValue] = useState('')
  const [saveTokenState, setSaveTokenState] = useState(false)
  const [removeTokenState, setRemoveTokenState] = useState(false)

  useEffect(() => {
    const token = props.config.get('settings/gist-access-token')
    if (token) {
      setTokenValue(token)
    }
  })

  const onchangeGenerateContractMetadata = (event) => {
    generateContractMetadat(props, event, dispatch)
  }

  const onchangeOption = (event) => {
    etherumVM(props, event, dispatch)
  }

  const textWrapEvent = (event) => {
    textWrapEventAction(props, event, dispatch)
  }

  const onchangePersonal = event => {
    personal(props, event, dispatch)
  }

  const onchangeMatomoAnalytics = event => {
    useMatomoAnalytics(props, event, dispatch)
  }

  const generalConfig = () => (
    <div className="$border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">General settings</h6>
        <div className="mt-2 custom-control custom-checkbox mb-1">
          <input onChange={onchangeGenerateContractMetadata} id="generatecontractmetadata" data-id="settingsTabGenerateContractMetadata" type="checkbox" className="custom-control-input" name="contractMetadata"/>
          <label className={`form-check-label custom-control-label align-middle ${state.elementState[0].textClass}`} data-id="settingsTabGenerateContractMetadataLabel" htmlFor="generatecontractmetadata">{generateContractMetadataText}</label>
        </div>
        <div className="fmt-2 custom-control custom-checkbox mb-1">
          <input onChange={onchangeOption} className="custom-control-input" id="alwaysUseVM" data-id="settingsTabAlwaysUseVM" type="checkbox" name="ethereumVM"/>
          <label className={`form-check-label custom-control-label align-middle ${state.elementState[1].textClass}`} htmlFor="alwaysUseVM">Always use Ethereum VM at Load</label>
        </div>
        <div className="mt-2 custom-control custom-checkbox mb-1">
          <input id="editorWrap" className="custom-control-input" type="checkbox" onChange={textWrapEvent} />
          <label className={`form-check-label custom-control-label align-middle ${state.elementState[2].textClass}`} htmlFor="editorWrap">Text Wrap</label>
        </div>
        <div className="custom-control custom-checkbox mb-1">
          <input onChange={onchangePersonal} id="personal" type="checkbox" className="custom-control-input" />
          <label className={`form-check-label custom-control-label align-middle ${state.elementState[3].textClass}`} htmlFor="personal">
            <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i> <span>   </span>
            <span>   </span>Enable Personal Mode for web3 provider. {warnText}
          </label>
        </div>
        <div className="custom-control custom-checkbox mb-1">
          <input onChange={onchangeMatomoAnalytics} id="settingsMatomoAnalytics" type="checkbox" className="custom-control-input" />
          <label className={`form-check-label custom-control-label align-middle ${state.elementState[4].textClass}`} htmlFor="settingsMatomoAnalytics">
            <span>Enable Matomo Analytics. We do not collect personally identifiable information (PII). The info is used to improve the site’s UX & UI. See more about </span>
            <a href="https://medium.com/p/66ef69e14931/" target="_blank"> Analytics in Remix IDE</a> <span>&</span> <a target="_blank" href="https://matomo.org/free-software">Matomo</a>
          </label>
        </div>
      </div>
    </div>
  )

  const saveToken = () => {
    setSaveTokenState(true)
    props.config.set('settings/gist-access-token', tokenValue)
  }

  const removeToken = () => {
    setRemoveTokenState(true)
    setTokenValue('')
    props.config.set('settings/gist-access-token', '')
  }

  const gistToken = () => (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">Github Access Token</h6>
        <p className="mb-1">Manage the access token used to publish to Gist and retrieve Github contents.</p>
        <p className="">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only 'create gist' permission.</p>
        <p className="mb-1"><a className="text-primary" target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></p>
        <div className=""><label>TOKEN:</label>
          <div className="text-secondary mb-0 h6">
            <input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" className="form-control" onChange={event => setTokenValue(event.target.value)} value={ tokenValue } />
            <div className="d-flex justify-content-end pt-2">
              <CopyToClipboard content={tokenValue} data-id='settingsTabGistAccessToken' />

              <input className="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onClick={() => saveToken()} value="Save" type="button" disabled={tokenValue === ''}></input>
              <button className="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" title="Delete Github access token" onClick={removeToken}>Remove</button>
            </div>
            <p className="pt-1">
              <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>
              <span className="text-warning">Please reload Remix after having saved the token.</span>
            </p>
          </div></div>
      </div>
    </div>
  )

  const themes = () => {
    const themes = props._deps.themeModule.getThemes()
    const onswitchTheme = (event, name) => {
      props._deps.themeModule.switchTheme(name)
    }
    if (themes) {
      return themes.map((aTheme) => (
        <div className="radio custom-control custom-radio mb-1 form-check">
          <input type="radio" onChange={event => { onswitchTheme(event, aTheme.name) }} className="align-middle custom-control-input" name="theme" id={aTheme.name} data-id={`settingsTabTheme${aTheme.name}`} />
          <label className="form-check-label custom-control-label" data-id={`settingsTabThemeLabel${aTheme.name}`} htmlFor={aTheme.name}>{aTheme.name} ({aTheme.quality})</label>
        </div>
      ))
    }
  }

  return (
    <div>
      {saveTokenState ? <Toaster message='Access token has been saved. RELOAD the page to apply it.' /> : null}
      {removeTokenState ? <Toaster message='Access token removed.' /> : null}
      {generalConfig()}
      {gistToken()}
      <div className="border-top">
        <div className="card-body pt-3 pb-2">
          <h6 className="card-title">Themes</h6>
          <div className="card-text themes-container">
            {themes()}
          </div>
        </div>
      </div>
    </div>
  )
}
