import React, { useState, useReducer, useEffect, useCallback } from 'react' // eslint-disable-line
import { CopyToClipboard } from '@remix-ui/clipboard' // eslint-disable-line

import { enablePersonalModeText, ethereunVMText, labels, generateContractMetadataText, matomoAnalytics, textDark, textSecondary, warnText, wordWrapText, swarmSettingsTitle, ipfsSettingsText } from './constants'

import './remix-ui-settings.css'
import { ethereumVM, generateContractMetadat, personal, textWrapEventAction, useMatomoAnalytics, saveTokenToast, removeTokenToast, saveSwarmSettingsToast, saveIpfsSettingsToast } from './settingsAction'
import { initialState, toastInitialState, toastReducer, settingReducer } from './settingsReducer'
import { Toaster } from '@remix-ui/toaster'// eslint-disable-line
import { RemixUiThemeModule, ThemeModule} from '@remix-ui/theme-module'

/* eslint-disable-next-line */
export interface RemixUiSettingsProps {
  config: any,
  editor: any,
   _deps: any,
   useMatomoAnalytics: boolean
   themeModule: ThemeModule
}

export const RemixUiSettings = (props: RemixUiSettingsProps) => {
  const [, dispatch] = useReducer(settingReducer, initialState)
  const [state, dispatchToast] = useReducer(toastReducer, toastInitialState)
  const [tokenValue, setTokenValue] = useState({})
  const [themeName, ] = useState('')
  const [privateBeeAddress, setPrivateBeeAddress] = useState('')
  const [postageStampId, setPostageStampId] = useState('')
  const [resetState, refresh] = useState(0)
  const [ipfsUrl, setipfsUrl] = useState('')
  const [ipfsPort, setipfsPort] = useState('')
  const [ipfsProtocol, setipfsProtocol] = useState('')
  const [ipfsProjectId, setipfsProjectId] = useState('')
  const [ipfsProjectSecret, setipfsProjectSecret] = useState('')


  const initValue = () => {
    const metadataConfig =  props.config.get('settings/generate-contract-metadata')
    if (metadataConfig === undefined || metadataConfig === null) generateContractMetadat(props.config, true, dispatch)

    const javascriptVM = props.config.get('settings/always-use-vm')
    if (javascriptVM === null || javascriptVM === undefined) ethereumVM(props.config, true, dispatch)
  }
  useEffect(() => initValue(), [resetState, props.config])
  useEffect(() => initValue(), [])

  useEffect(() => {
    const token = props.config.get('settings/' + labels['gist'].key)
    if (token) {
      setTokenValue(prevState => {
        return { ...prevState, gist: token }
      })
    }

    const etherscantoken = props.config.get('settings/' + labels['etherscan'].key)
    if (etherscantoken) {
      setTokenValue(prevState => {
        return { ...prevState, etherscan: etherscantoken }
      })
    }
    const configPrivateBeeAddress = props.config.get('settings/swarm-private-bee-address')
    if (configPrivateBeeAddress) {
      setPrivateBeeAddress(configPrivateBeeAddress)
    }
    const configPostageStampId = props.config.get('settings/swarm-postage-stamp-id')
    if (configPostageStampId) {
      setPostageStampId(configPostageStampId)
    }

    const configipfsUrl = props.config.get('settings/ipfs-url')
    if (configipfsUrl) {
      setipfsUrl(configipfsUrl)
    }
    const configipfsPort = props.config.get('settings/ipfs-port')
    if (configipfsPort) {
      setipfsPort(configipfsPort)
    }
    const configipfsProtocol = props.config.get('settings/ipfs-protocol')
    if (configipfsProtocol) {
      setipfsProtocol(configipfsProtocol)
    }
    const configipfsProjectId = props.config.get('settings/ipfs-project-id')
    if (configipfsProjectId) {
      setipfsProjectId(configipfsProjectId)
    }
    const configipfsProjectSecret = props.config.get('settings/ipfs-project-secret')
    if (configipfsProjectSecret) {
      setipfsProjectSecret(configipfsProjectSecret)
    }


  }, [themeName, state.message])

  useEffect(() => {
    if (props.useMatomoAnalytics !== null) useMatomoAnalytics(props.config, props.useMatomoAnalytics, dispatch)
  }, [props.useMatomoAnalytics])

  const onchangeGenerateContractMetadata = (event) => {
    generateContractMetadat(props.config, event.target.checked, dispatch)
  }

  const onchangeOption = (event) => {
    ethereumVM(props.config, event.target.checked, dispatch)
  }

  const textWrapEvent = (event) => {
    textWrapEventAction(props.config, props.editor, event.target.checked, dispatch)
  }

  const onchangePersonal = event => {
    personal(props.config, event.target.checked, dispatch)
  }

  const onchangeMatomoAnalytics = event => {
    useMatomoAnalytics(props.config, event.target.checked, dispatch)
  }

  const getTextClass = (key) => {
    if (props.config.get(key)) {
      return textDark
    } else {
      return textSecondary
    }
  }

  const generalConfig = () => {
    const isMetadataChecked = props.config.get('settings/generate-contract-metadata') || false
    const isEthereumVMChecked = props.config.get('settings/always-use-vm') || false
    const isEditorWrapChecked = props.config.get('settings/text-wrap') || false
    const isPersonalChecked = props.config.get('settings/personal-mode') || false
    const isMatomoChecked = props.config.get('settings/matomo-analytics') || false

    return (
      <div className="$border-top">
        <div title="Reset to Default settings." className='d-flex justify-content-end pr-4'>
          <button className="btn btn-sm btn-secondary ml-2" onClick={() => {
                try {
                  if ((window as any).remixFileSystem.name === 'indexedDB') {
                    props.config.clear()
                    try {
                      localStorage.clear() // remove the whole storage
                    } catch (e) {
                      console.log(e)
                    }
                  } else {
                    props.config.clear() // remove only the remix settings
                  }
                  refresh(resetState + 1)
                } catch (e) {
                  console.log(e)
                }
              }}>Reset to Default settings</button>
        </div>
        <div className="card-body pt-3 pb-2">
          <h6 className="card-title">General settings</h6>
          <div className="mt-2 custom-control custom-checkbox mb-1">
            <input onChange={onchangeGenerateContractMetadata} id="generatecontractmetadata" data-id="settingsTabGenerateContractMetadata" type="checkbox" className="custom-control-input" name="contractMetadata" checked = { isMetadataChecked }/>
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/generate-contract-metadata')}`} data-id="settingsTabGenerateContractMetadataLabel" htmlFor="generatecontractmetadata">{generateContractMetadataText}</label>
          </div>
          <div className="fmt-2 custom-control custom-checkbox mb-1">
            <input onChange={onchangeOption} className="custom-control-input" id="alwaysUseVM" data-id="settingsTabAlwaysUseVM" type="checkbox" name="ethereumVM" checked={ isEthereumVMChecked }/>
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/always-use-vm')}`} htmlFor="alwaysUseVM">{ethereunVMText}</label>
          </div>
          <div className="mt-2 custom-control custom-checkbox mb-1">
            <input id="editorWrap" className="custom-control-input" type="checkbox" onChange={textWrapEvent} checked = { isEditorWrapChecked }/>
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/text-wrap')}`} htmlFor="editorWrap">{wordWrapText}</label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangePersonal} id="personal" type="checkbox" className="custom-control-input" checked = { isPersonalChecked }/>
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/personal-mode')}`} htmlFor="personal">
              <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i> <span>   </span>
              <span>   </span>{enablePersonalModeText} {warnText}
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeMatomoAnalytics} id="settingsMatomoAnalytics" type="checkbox" className="custom-control-input" checked={ isMatomoChecked }/>
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/matomo-analytics')}`} htmlFor="settingsMatomoAnalytics">
              <span>{matomoAnalytics}</span>
              <a href="https://medium.com/p/66ef69e14931/" target="_blank"> Analytics in Remix IDE</a> <span>&</span> <a target="_blank" href="https://matomo.org/free-software">Matomo</a>
            </label>
          </div>
        </div>
      </div>
    )
  }

  // api key settings
  const saveToken = (type: string) => {
    saveTokenToast(props.config, dispatchToast, tokenValue[type], labels[type].key)
  }

  const removeToken = (type: string) => {
    setTokenValue(prevState => {
      return { ...prevState, [type]: ''}
    })
    removeTokenToast(props.config, dispatchToast, labels[type].key)
  }

  const handleSaveTokenState = useCallback(
    (event, type) => {
      setTokenValue(prevState => {
        return { ...prevState, [type]: event.target.value}
      })
    },
    [tokenValue]
  )

  const token = (type: string) => (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">{ labels[type].title }</h6>
        <p className="mb-1">{ labels[type].message1 }</p>
        <p className="">{ labels[type].message2 }</p>
        <p className="mb-1"><a className="text-primary" target="_blank" href={labels[type].link}>{ labels[type].link }</a></p>
        <div className=""><label>TOKEN:</label>
          <div className="text-secondary mb-0 h6">
            <input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" className="form-control" onChange={(e) => handleSaveTokenState(e, type)} value={ tokenValue[type] } />
            <div className="d-flex justify-content-end pt-2">
              <CopyToClipboard content={tokenValue[type]} data-id='copyToClipboardCopyIcon' />
              <input className="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onClick={() => saveToken(type)} value="Save" type="button" disabled={tokenValue === ''}></input>
              <button className="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" title="Delete GitHub access token" onClick={() => removeToken(type)}>Remove</button>
            </div>
          </div></div>
      </div>
    </div>
  )

  // swarm settings
  const handleSavePrivateBeeAddress = useCallback(
    (event) => {
      setPrivateBeeAddress(event.target.value)
    },
    [privateBeeAddress]
  )

  const handleSavePostageStampId = useCallback(
    (event) => {
      setPostageStampId(event.target.value)
    },
    [postageStampId]
  )

  const saveSwarmSettings = () => {
    saveSwarmSettingsToast(props.config, dispatchToast, privateBeeAddress, postageStampId)
  }

  const swarmSettings = () => (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">{ swarmSettingsTitle }</h6>
        <div className="pt-2 mb-1"><label>PRIVATE BEE ADDRESS:</label>
          <div className="text-secondary mb-0 h6">
            <input id="swarmprivatebeeaddress" data-id="settingsPrivateBeeAddress" className="form-control" onChange={handleSavePrivateBeeAddress} value={ privateBeeAddress } />
          </div>
        </div>
        <div className=""><label>POSTAGE STAMP ID:</label>
          <div className="text-secondary mb-0 h6">
            <input id="swarmpostagestamp" data-id="settingsPostageStampId" className="form-control" onChange={handleSavePostageStampId} value={ postageStampId } />
            <div className="d-flex justify-content-end pt-2">
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end pt-2">
          <input className="btn btn-sm btn-primary ml-2" id="saveswarmsettings" data-id="settingsTabSaveSwarmSettings" onClick={() => saveSwarmSettings()} value="Save" type="button" disabled={privateBeeAddress === ''}></input>
        </div>
      </div>
    </div>
  )

  // ipfs settings

  const handleSaveIpfsProjectId = useCallback(
    (event) => {
      setipfsProjectId(event.target.value)
    }
    , [ipfsProjectId]
  )

  const handleSaveIpfsSecret = useCallback(
    (event) => {
      setipfsProjectSecret(event.target.value)
    }
    , [ipfsProjectSecret]
  )

  const handleSaveIpfsUrl = useCallback(
    (event) => {
      setipfsUrl(event.target.value)
    }
    , [ipfsUrl]
  )

  const handleSaveIpfsPort = useCallback(
    (event) => {
      setipfsPort(event.target.value)
    }
    , [ipfsPort]
  )

  const handleSaveIpfsProtocol = useCallback(
    (event) => {
      setipfsProtocol(event.target.value)
    }
    , [ipfsProtocol]
  )

  const saveIpfsSettings = () => {
    saveIpfsSettingsToast(props.config, dispatchToast, ipfsUrl, ipfsProtocol, ipfsPort, ipfsProjectId, ipfsProjectSecret)
  }

  const ipfsSettings = () => (
    <div className="border-top">
    <div className="card-body pt-3 pb-2">
      <h6 className="card-title">{ ipfsSettingsText }</h6>
      <div className="pt-2 mb-1"><label>IPFS HOST:</label>
        <div className="text-secondary mb-0 h6">
          <input placeholder='e.g. ipfs.infura.io' id="settingsIpfsUrl" data-id="settingsIpfsUrl" className="form-control" onChange={handleSaveIpfsUrl} value={ ipfsUrl } />
        </div>
      </div>
      <div className=""><label>IPFS PROTOCOL:</label>
        <div className="text-secondary mb-0 h6">
          <input placeholder='e.g. https' id="settingsIpfsProtocol" data-id="settingsIpfsProtocol" className="form-control" onChange={handleSaveIpfsProtocol} value={ ipfsProtocol } />
        </div>
      </div>
      <div className=""><label>IPFS PORT:</label>
        <div className="text-secondary mb-0 h6">
          <input placeholder='e.g. 5001' id="settingsIpfsPort" data-id="settingsIpfsPort" className="form-control" onChange={handleSaveIpfsPort} value={ ipfsPort } />
        </div>
      </div>
      <div className=""><label>IPFS PROJECT ID [ INFURA ]:</label>
        <div className="text-secondary mb-0 h6">
          <input id="settingsIpfsProjectId" data-id="settingsIpfsProjectId" className="form-control" onChange={handleSaveIpfsProjectId} value={ ipfsProjectId } />
        </div>
      </div>
      <div className=""><label>IPFS PROJECT SECRET [ INFURA ]:</label>
        <div className="text-secondary mb-0 h6">
          <input id="settingsIpfsProjectSecret" data-id="settingsIpfsProjectSecret" className="form-control" type="password" onChange={handleSaveIpfsSecret} value={ ipfsProjectSecret } />
        </div>
      </div>
      <div className="d-flex justify-content-end pt-2">
        <input className="btn btn-sm btn-primary ml-2" id="saveIpfssettings" data-id="settingsTabSaveIpfsSettings" onClick={() => saveIpfsSettings()} value="Save" type="button"></input>
    </div>
    </div>
  </div>)


  return (
    <div>
      {state.message ? <Toaster message= {state.message}/> : null}
      {generalConfig()}     
      {token('gist')}
      {token('etherscan')}
      {swarmSettings()}
      {ipfsSettings()}
      <RemixUiThemeModule themeModule={props._deps.themeModule} />
    </div>
  )
}
