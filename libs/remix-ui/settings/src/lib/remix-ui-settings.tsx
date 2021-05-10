import React, { useState, useReducer, useEffect } from 'react' // eslint-disable-line
import { CopyToClipboard } from '@remix-ui/clipboard' // eslint-disable-line

import { generateContractMetadataText, warnText } from './constants'

import './remix-ui-settings.css'
import { etherumVM, generateContractMetadat, personal, textWrapEventAction, useMatomoAnalytics } from './settingsAction'
import { initialState, settingReducer } from './settingsReducer'

/* eslint-disable-next-line */
export interface RemixUiSettingsProps {
  config: any,
  editor: any
}

export const RemixUiSettings = (props: RemixUiSettingsProps) => {
  const [state, dispatch] = useReducer(settingReducer, initialState)
  const [tokenValue, setTokenValue] = useState('')

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
          {console.log({ state }, ' in general config')}
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
    props.config.set('settings/gist-access-token', tokenValue)
    tooltip('Access token has been saved. RELOAD the page to apply it.')
  }

  const removeToken = () => {
    props.config.set('settings/gist-access-token', '')
    setTokenValue('')
    tooltip('Access token removed')
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
            <input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" className="form-control" onChange={event => setTokenValue(event.target.value)}/>
            <div className="d-flex justify-content-end pt-2">
              <CopyToClipboard content={tokenValue} data-id='settingsTabGistAccessToken' />

              <input className="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onClick={() => saveToken()} value="Save" type="button"></input>
              <button className="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" title="Delete Github access token" onClick={() => removeToken()}>Remove</button>
            </div>
            <p className="pt-1">
              <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>
              <span className="text-warning">Please reload Remix after having saved the token.</span>
            </p>
          </div></div>
      </div>
    </div>
  )

  return (
    <div>
      {generalConfig()}
      {gistToken()}
    </div>
  )
}
