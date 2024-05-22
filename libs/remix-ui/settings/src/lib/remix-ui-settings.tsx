import { ViewPlugin } from '@remixproject/engine-web'
import React, {useState, useRef, useReducer, useEffect, useCallback} from 'react' // eslint-disable-line
import { CustomTooltip } from '@remix-ui/helper'
const _paq = (window._paq = window._paq || [])

import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import { labels, textDark, textSecondary } from './constants'

import './remix-ui-settings.css'
import {
  generateContractMetadat,
  personal,
  copilotActivate,
  copilotMaxNewToken,
  copilotTemperature,
  textWrapEventAction,
  useMatomoAnalytics,
  saveTokenToast,
  removeTokenToast,
  saveSwarmSettingsToast,
  saveIpfsSettingsToast,
  useAutoCompletion,
  useShowGasInEditor,
  useDisplayErrors,
  saveEnvState
} from './settingsAction'
import { initialState, toastInitialState, toastReducer, settingReducer } from './settingsReducer'
import {Toaster} from '@remix-ui/toaster' // eslint-disable-line
import { RemixUiThemeModule, ThemeModule } from '@remix-ui/theme-module'
import { RemixUiLocaleModule, LocaleModule } from '@remix-ui/locale-module'
import { FormattedMessage, useIntl } from 'react-intl'
import { GithubSettings } from './github-settings'
import { EtherscanSettings } from './etherscan-settings'
import { SindriSettings } from './sindri-settings'

/* eslint-disable-next-line */
export interface RemixUiSettingsProps {
  plugin: ViewPlugin
  config: any
  editor: any
  _deps: any
  useMatomoAnalytics: boolean
  useCopilot: boolean
  themeModule: ThemeModule
  localeModule: LocaleModule
}

export const RemixUiSettings = (props: RemixUiSettingsProps) => {
  const [, dispatch] = useReducer(settingReducer, initialState)
  const [state, dispatchToast] = useReducer(toastReducer, toastInitialState)
  const [tokenValue, setTokenValue] = useState({}) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [themeName] = useState('')
  const [privateBeeAddress, setPrivateBeeAddress] = useState('')
  const [postageStampId, setPostageStampId] = useState('')
  const [resetState, refresh] = useState(0)
  const [ipfsUrl, setipfsUrl] = useState('')
  const [ipfsPort, setipfsPort] = useState('')
  const [ipfsProtocol, setipfsProtocol] = useState('')
  const [ipfsProjectId, setipfsProjectId] = useState('')
  const [ipfsProjectSecret, setipfsProjectSecret] = useState('')

  const intl = useIntl()
  const initValue = () => {
    const metadataConfig = props.config.get('settings/generate-contract-metadata')
    if (metadataConfig === undefined || metadataConfig === null) generateContractMetadat(props.config, true, dispatch)

    const useAutoComplete = props.config.get('settings/auto-completion')
    if (useAutoComplete === null || useAutoComplete === undefined) useAutoCompletion(props.config, true, dispatch)

    const displayErrors = props.config.get('settings/display-errors')
    if (displayErrors === null || displayErrors === undefined) useDisplayErrors(props.config, true, dispatch)

    const useShowGas = props.config.get('settings/show-gas')
    if (useShowGas === null || useShowGas === undefined) useShowGasInEditor(props.config, true, dispatch)

    const enableSaveEnvState = props.config.get('settings/save-evm-state')
    if (enableSaveEnvState === null || enableSaveEnvState === undefined) saveEnvState(props.config, true, dispatch)
  }
  useEffect(() => initValue(), [resetState, props.config])
  useEffect(() => initValue(), [])

  useEffect(() => {
    const token = props.config.get('settings/' + labels['gist'].key)
    if (token) {
      setTokenValue((prevState) => {
        return { ...prevState, gist: token }
      })
    }

    const etherscantoken = props.config.get('settings/' + labels['etherscan'].key)
    if (etherscantoken) {
      setTokenValue((prevState) => {
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

  const textWrapEvent = (event) => {
    textWrapEventAction(props.config, props.editor, event.target.checked, dispatch)
  }

  const onchangeCopilotActivate = () => {
    if (!props.useCopilot) {
      copilotActivate(props.config, props.useCopilot, dispatch)
      props.plugin.call('terminal', 'log', { type: 'typewriterlog', value: `Solidity copilot not activated!` })
      return
    }

    const startCopilot = async () => {
      copilotActivate(props.config, props.useCopilot, dispatch)
      props.plugin.call('terminal', 'log', { type: 'typewriterlog', value: `Solidity copilot activated!` })
    }

    startCopilot()
  }

  useEffect(() => {
    if (props.useCopilot !== null) copilotActivate(props.config, props.useCopilot, dispatch)
    onchangeCopilotActivate()
  }, [props.useCopilot])

  const onchangeCopilotMaxNewToken = (event) => {
    copilotMaxNewToken(props.config, parseInt(event.target.value), dispatch)
  }

  const onchangeCopilotTemperature = (event) => {
    copilotTemperature(props.config, parseInt(event.target.value) / 100, dispatch)
  }

  const onchangePersonal = (event) => {
    personal(props.config, event.target.checked, dispatch)
  }

  const onchangeMatomoAnalytics = (event) => {
    useMatomoAnalytics(props.config, event.target.checked, dispatch)
  }

  const onchangeUseAutoComplete = (event) => {
    useAutoCompletion(props.config, event.target.checked, dispatch)
  }

  const onchangeShowGasInEditor = (event) => {
    useShowGasInEditor(props.config, event.target.checked, dispatch)
  }
  const onchangeDisplayErrors = (event) => {
    useDisplayErrors(props.config, event.target.checked, dispatch)
  }

  const onchangeSaveEnvState= (event) => {
    saveEnvState(props.config, event.target.checked, dispatch)
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
    const isEditorWrapChecked = props.config.get('settings/text-wrap') || false
    const isPersonalChecked = props.config.get('settings/personal-mode') || false
    const isMatomoChecked = props.config.get('settings/matomo-analytics') || false

    const isAutoCompleteChecked = props.config.get('settings/auto-completion') || false
    const isShowGasInEditorChecked = props.config.get('settings/show-gas') || false
    const displayErrorsChecked = props.config.get('settings/display-errors') || false
    const isSaveEvmStateChecked = props.config.get('settings/save-evm-state') || false
    return (
      <div className="$border-top">
        <div className="d-flex justify-content-end pr-4">
          <button
            className="btn btn-sm btn-secondary ml-2"
            onClick={() => {
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
            }}
          >
            <FormattedMessage id="settings.reset" />
          </button>
        </div>
        <div className="card-body pt-3 pb-2">
          <h6 className="card-title">
            <FormattedMessage id="settings.general" />
          </h6>
          <div className="mt-2 custom-control custom-checkbox mb-1">
            <input
              onChange={onchangeGenerateContractMetadata}
              id="generatecontractmetadata"
              data-id="settingsTabGenerateContractMetadata"
              type="checkbox"
              className="custom-control-input"
              name="contractMetadata"
              checked={isMetadataChecked}
            />
            <label
              className={`form-check-label custom-control-label align-middle ${getTextClass('settings/generate-contract-metadata')}`}
              data-id="settingsTabGenerateContractMetadataLabel"
              htmlFor="generatecontractmetadata"
            >
              <FormattedMessage id="settings.generateContractMetadataText" />
            </label>
          </div>
          <div className="mt-2 custom-control custom-checkbox mb-1">
            <input id="editorWrap" className="custom-control-input" type="checkbox" onChange={textWrapEvent} checked={isEditorWrapChecked} />
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/text-wrap')}`} htmlFor="editorWrap">
              <FormattedMessage id="settings.wordWrapText" />
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeUseAutoComplete} id="settingsUseAutoComplete" type="checkbox" className="custom-control-input" checked={isAutoCompleteChecked} />
            <label
              className={`form-check-label custom-control-label align-middle ${getTextClass('settings/auto-completion')}`}
              data-id="settingsAutoCompleteLabel"
              htmlFor="settingsUseAutoComplete"
            >
              <span>
                <FormattedMessage id="settings.useAutoCompleteText" />
              </span>
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeShowGasInEditor} id="settingsUseShowGas" type="checkbox" className="custom-control-input" checked={isShowGasInEditorChecked} />
            <label
              className={`form-check-label custom-control-label align-middle ${getTextClass('settings/show-gas')}`}
              data-id="settingsShowGasLabel"
              htmlFor="settingsUseShowGas"
            >
              <span>
                <FormattedMessage id="settings.useShowGasInEditorText" />
              </span>
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeDisplayErrors} id="settingsDisplayErrors" type="checkbox" className="custom-control-input" checked={displayErrorsChecked} />
            <label
              className={`form-check-label custom-control-label align-middle ${getTextClass('settings/display-errors')}`}
              data-id="displayErrorsLabel"
              htmlFor="settingsDisplayErrors"
            >
              <span>
                <FormattedMessage id="settings.displayErrorsText" />
              </span>
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangePersonal} id="personal" type="checkbox" className="custom-control-input" checked={isPersonalChecked} />
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/personal-mode')}`} htmlFor="personal">
              <i className="fas fa-exclamation-triangle text-warning" aria-hidden="true"></i> <span> </span>
              <span> </span>
              <FormattedMessage id="settings.enablePersonalModeText" />
              &nbsp;
              <FormattedMessage id="settings.warnText" />
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeMatomoAnalytics} id="settingsMatomoAnalytics" type="checkbox" className="custom-control-input" checked={isMatomoChecked} />
            <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/matomo-analytics')}`} htmlFor="settingsMatomoAnalytics">
              <span>
                <FormattedMessage id="settings.matomoAnalytics" />
              </span>
              <a href="https://medium.com/p/66ef69e14931/" target="_blank">
                {' '}
                <FormattedMessage id="settings.analyticsInRemix" />
              </a>{' '}
              <span>&</span>{' '}
              <a target="_blank" href="https://matomo.org/free-software">
                Matomo
              </a>
            </label>
          </div>
          <div className="custom-control custom-checkbox mb-1">
            <input onChange={onchangeSaveEnvState} id="settingsEnableSaveEnvState" data-id="settingsEnableSaveEnvState" type="checkbox" className="custom-control-input" checked={isSaveEvmStateChecked} />
            <label
              className={`form-check-label custom-control-label align-middle ${getTextClass('settings/save-evm-state')}`}
              data-id="settingsEnableSaveEnvStateLabel"
              htmlFor="settingsEnableSaveEnvState"
            >
              <span>
                <FormattedMessage id="settings.enableSaveEnvState" />
              </span>
            </label>
          </div>
        </div>
      </div>
    )
  }

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
        <h6 className="card-title">
          <FormattedMessage id="settings.swarm" />
        </h6>
        <div className="pt-2 pt-2 mb-0 pb-0">
          <label className="m-0">
            <FormattedMessage id="settings.privateBeeAddress" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="swarmprivatebeeaddress" data-id="settingsPrivateBeeAddress" className="form-control" onChange={handleSavePrivateBeeAddress} value={privateBeeAddress} />
          </div>
        </div>
        <div className="pt-2 mb-0 pb-0">
          <label className="m-0">
            <FormattedMessage id="settings.postageStampID" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="swarmpostagestamp" data-id="settingsPostageStampId" className="form-control" onChange={handleSavePostageStampId} value={postageStampId} />
            <div className="d-flex justify-content-end pt-2"></div>
          </div>
        </div>
        <div className="d-flex justify-content-end pt-2">
          <input
            className="btn btn-sm btn-primary ml-2"
            id="saveswarmsettings"
            data-id="settingsTabSaveSwarmSettings"
            onClick={() => saveSwarmSettings()}
            value={intl.formatMessage({ id: 'settings.save' })}
            type="button"
            disabled={privateBeeAddress === ''}
          ></input>
        </div>
      </div>
    </div>
  )

  // ipfs settings

  const handleSaveIpfsProjectId = useCallback(
    (event) => {
      setipfsProjectId(event.target.value)
    },
    [ipfsProjectId]
  )

  const handleSaveIpfsSecret = useCallback(
    (event) => {
      setipfsProjectSecret(event.target.value)
    },
    [ipfsProjectSecret]
  )

  const handleSaveIpfsUrl = useCallback(
    (event) => {
      setipfsUrl(event.target.value)
    },
    [ipfsUrl]
  )

  const handleSaveIpfsPort = useCallback(
    (event) => {
      setipfsPort(event.target.value)
    },
    [ipfsPort]
  )

  const handleSaveIpfsProtocol = useCallback(
    (event) => {
      setipfsProtocol(event.target.value)
    },
    [ipfsProtocol]
  )

  const saveIpfsSettings = () => {
    saveIpfsSettingsToast(props.config, dispatchToast, ipfsUrl, ipfsProtocol, ipfsPort, ipfsProjectId, ipfsProjectSecret)
  }

  const isCopilotActivated = props.config.get('settings/copilot/suggest/activate') || false
  let copilotMaxnewToken = props.config.get('settings/copilot/suggest/max_new_tokens')
  if (!copilotMaxnewToken) {
    props.config.set('settings/copilot/suggest/max_new_tokens', 10)
    copilotMaxnewToken = 10
  }
  let copilotTemperatureValue = (props.config.get('settings/copilot/suggest/temperature')) * 100
  if (!copilotTemperatureValue) {
    props.config.set('settings/copilot/suggest/temperature', 0.9)
    copilotTemperatureValue = 0.9
  }

  const copilotSettings = () => (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title d-inline">
          <FormattedMessage id="settings.copilot" />
        </h6>
        <CustomTooltip placement="bottom" tooltipId="overlay-tooltip-aiDocumentation" tooltipText={<FormattedMessage id="remixUiTabs.tooltipText8" />}>
          <span
            data-id="remix_ai_docs"
            id="remix_ai_docs"
            className="btn pl-2 pr-0 py-0 d-inline ai-docs"
            role='link'
            onClick={()=>{
              window.open("https://remix-ide.readthedocs.io/en/latest/ai.html")
              _paq.push(['trackEvent', 'ai', 'solcoder', 'documentation'])
            }}
          >
            <i aria-hidden="true" className="fas fa-book"></i>
          </span>
        </CustomTooltip>

        <div className="pt-2 mb-0">
          <div className="text-secondary mb-0 h6">
            <div>
              <div className="mb-1">
                <label className={`form-check-label align-middle ${getTextClass('settings/copilot/suggest/max_new_tokens')}`} htmlFor="copilot-activate">
                  <FormattedMessage id="settings.copilot.max_new_tokens" /> - <span>{copilotMaxnewToken}</span>
                </label>
                <input onChange={onchangeCopilotMaxNewToken} id="copilot-max-new-token" value={copilotMaxnewToken} min='1' max='150' type="range" className="custom-range" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 mb-0">
          <div className="text-secondary mb-0 h6">
            <div>
              <div className="mb-1">
                <label className={`form-check-label align-middle ${getTextClass('settings/copilot/suggest/temperature')}`} htmlFor="copilot-activate">
                  <FormattedMessage id="settings.copilot.temperature" /> - <span>{copilotTemperatureValue / 100}</span>
                </label>
                <input onChange={onchangeCopilotTemperature} id="copilot-temperature" value={copilotTemperatureValue} min='0' max='100' type="range" className="custom-range" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )

  const ipfsSettings = () => (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id="settings.ipfs" />
        </h6>
        <div className="pt-2 mb-0">
          <label className="m-0">
            IPFS <FormattedMessage id="settings.host" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input placeholder="e.g. ipfs.infura.io" id="settingsIpfsUrl" data-id="settingsIpfsUrl" className="form-control" onChange={handleSaveIpfsUrl} value={ipfsUrl} />
          </div>
        </div>
        <div className="pt-2 mb-0 pb-0">
          <label className="m-0">
            IPFS <FormattedMessage id="settings.protocol" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input
              placeholder="e.g. https"
              id="settingsIpfsProtocol"
              data-id="settingsIpfsProtocol"
              className="form-control"
              onChange={handleSaveIpfsProtocol}
              value={ipfsProtocol}
            />
          </div>
        </div>
        <div className="pt-2 mb-0 pb-0">
          <label className="m-0">
            IPFS <FormattedMessage id="settings.port" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input placeholder="e.g. 5001" id="settingsIpfsPort" data-id="settingsIpfsPort" className="form-control" onChange={handleSaveIpfsPort} value={ipfsPort} />
          </div>
        </div>
        <div className="pt-2 mb-0 pb-0">
          <label className="m-0">
            IPFS <FormattedMessage id="settings.projectID" /> [ INFURA ]:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="settingsIpfsProjectId" data-id="settingsIpfsProjectId" className="form-control" onChange={handleSaveIpfsProjectId} value={ipfsProjectId} />
          </div>
        </div>
        <div className="pt-2 mb-0 pb-0">
          <label className="m-0">
            IPFS <FormattedMessage id="settings.projectSecret" /> [ INFURA ]:
          </label>
          <div className="text-secondary mb-0 h6">
            <input
              id="settingsIpfsProjectSecret"
              data-id="settingsIpfsProjectSecret"
              className="form-control"
              type="password"
              onChange={handleSaveIpfsSecret}
              value={ipfsProjectSecret}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end pt-2">
          <input
            className="btn btn-sm btn-primary ml-2"
            id="saveIpfssettings"
            data-id="settingsTabSaveIpfsSettings"
            onClick={() => saveIpfsSettings()}
            value={intl.formatMessage({ id: 'settings.save' })}
            type="button"
          ></input>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {state.message ? <Toaster message={state.message} /> : null}
      {generalConfig()}
      {copilotSettings()}
      <GithubSettings
        saveToken={(githubToken: string, githubUserName: string, githubEmail: string) => {
          saveTokenToast(props.config, dispatchToast, githubToken, 'gist-access-token')
          saveTokenToast(props.config, dispatchToast, githubUserName, 'github-user-name')
          saveTokenToast(props.config, dispatchToast, githubEmail, 'github-email')
        }}
        removeToken={() => {
          removeTokenToast(props.config, dispatchToast, 'gist-access-token')
          removeTokenToast(props.config, dispatchToast, 'github-user-name')
          removeTokenToast(props.config, dispatchToast, 'github-email')
        }}
        config={props.config}
      />
      <EtherscanSettings
        saveToken={(etherscanToken: string) => {
          saveTokenToast(props.config, dispatchToast, etherscanToken, 'etherscan-access-token')
        }}
        removeToken={() => {
          removeTokenToast(props.config, dispatchToast, 'etherscan-access-token')
        }}
        config={props.config}
      />
      <SindriSettings
        saveToken={(sindriToken: string) => {
          saveTokenToast(props.config, dispatchToast, sindriToken, 'sindri-access-token')
        }}
        removeToken={() => {
          removeTokenToast(props.config, dispatchToast, 'sindri-access-token')
        }}
        config={props.config}
      />
      {swarmSettings()}
      {ipfsSettings()}
      <RemixUiThemeModule themeModule={props._deps.themeModule} />
      <RemixUiLocaleModule localeModule={props._deps.localeModule} />
    </div>
  )
}
