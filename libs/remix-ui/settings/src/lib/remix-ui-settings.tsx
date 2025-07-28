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
  useMatomoPerfAnalytics,
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
import { GeneralSettings } from './general-settings'
import { SettingsSection } from '../types'

/* eslint-disable-next-line */
export interface RemixUiSettingsProps {
  plugin: ViewPlugin
  config: any
  editor: any
  _deps: any
  useMatomoPerfAnalytics: boolean
  useCopilot: boolean
  themeModule: ThemeModule
  localeModule: LocaleModule
}

const settingsSections: SettingsSection[] = [
  {
    key: 'general',
    label: 'General Settings',
    decription: 'Manage code editor settings, UI theme, language and analytics permissions.',
    subSections: [
      {
        title: 'Code editor',
        options: [{
          label: 'Generate contract metadata',
          description: 'Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.'
        }, {
          label: 'Enable code completion in editor'
        }, {
          label: 'Display gas estimates in editor'
        }, {
          label: 'Display errors in editor while typing'
        }, {
          label: 'Enable Personal Mode for web3 provider',
          labelIcon: 'fa fa-exclamation-triangle text-warning'
        }, {
          label: 'Save environment state'
        }]
      }
    ]
  },
  { key: 'analytics', label: 'Analytics', decription: 'Control how Remix uses AI and analytics to improve your experience.', subSections: []},
  { key: 'ai', label: 'Remix AI Assistant', decription: 'The Remix AI Assistant enhances your coding experience with smart suggestions and automated insights. Manage how AI interacts with your code and data.', subSections: []},
  { key: 'services', label: 'Connected Services', decription: 'Configure the settings for connected services, including Github, IPFS, Swarm, Sidri and Etherscan.', subSections: []},
];

const initialToggles = {
  generateContractMetadata: true,
  codeCompletion: true,
  gasEstimates: true,
  errorsInEditor: true,
  personalMode: true,
  saveEnvState: true,
  language: 'English',
  theme: 'Dark',
  aiCopilot: true,
  aiAnalyzeContext: true,
  aiExternalApi: true,
  matomoNoCookies: true,
  matomoWithCookies: true,
  githubEnabled: true,
  ipfsEnabled: true,
  swarmEnabled: true,
  sindriEnabled: true,
};

export const RemixUiSettings = (props: RemixUiSettingsProps) => {
  const [selected, setSelected] = useState('general');
  const [toggles, setToggles] = useState(initialToggles);
  const [inputs, setInputs] = useState({
    githubToken: '',
    githubUsername: '',
    githubEmail: '',
    ipfsHost: '',
    ipfsProtocol: '',
    ipfsPort: '',
    ipfsProjectId: '',
    ipfsProjectSecret: '',
    swarmBee: '',
    swarmStamp: '',
    sindriToken: '',
  });

  const handleToggle = (key) => setToggles({ ...toggles, [key]: !toggles[key] });
  const handleInput = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  return (
    <div className="container-fluid bg-light">
      <div className='pt-5'></div>
      <div className='d-flex flex-row px-5'>
        <div className="input-group remix-settings-sidebar">
          <h1 className="d-inline-block text-white" style={{ minWidth: '350px', maxWidth: '400px', flex: '0 0 370px' }}>Settings</h1>
          <div className='d-flex flex-fill'>
            <span className="input-group-text"><i className="fa fa-search"></i></span>
            <input type="text" className="form-control shadow-none" placeholder="Search settings" style={{ minWidth: '200px', height: '40px' }} />
          </div>
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-stretch">
        {/* Sidebar */}
        <div
          className="flex-column bg-transparent p-0 remix-settings-sidebar"
          style={{ minWidth: '350px', maxWidth: '400px', flex: '0 0 370px' }}
        >
          <div className="pt-4">
            <ul className="mt-4 px-5 list-unstyled">
              {settingsSections.map((section) => (
                <li
                  className={`nav-item border-bottom px-0 py-3 ${selected === section.key ? 'active text-white' : 'text-secondary'}`}
                  key={section.key}
                >
                  <a
                    className="nav-link p-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(section.key)}
                  >
                    <h3 className={`${selected === section.key ? 'active text-white' : 'text-secondary'}`}>{section.label}</h3>
                    {selected !== section.key && <span style={{ fontSize: '0.7rem' }}>{section.decription}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Main Content */}
        <div
          className="flex-column p-0 flex-grow-1"
          style={{ minWidth: 0, flexBasis: '300px', flexGrow: 1, flexShrink: 1, maxWidth: '100%' }}
        >
          <div className="pt-4 px-5">
            <div className="mt-4">
              {selected === 'general' && <GeneralSettings section={settingsSections.find(section => section.key === selected)} />}
            </div>
            {selected === 'analytics' && (
              <div>
                <h4 className="text-white mb-4">Analytics</h4>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">AI Copilot</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="aiCopilot" checked={toggles.aiCopilot} onChange={() => handleToggle('aiCopilot')} />
                      <label className="custom-control-label" htmlFor="aiCopilot">AI Copilot assists with code suggestions and improvements.</label>
                    </div>
                    <a href="#" className="text-info small">Learn more about AI Copilot</a>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Matomo Analytics (no cookies)</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="matomoNoCookies" checked={toggles.matomoNoCookies} onChange={() => handleToggle('matomoNoCookies')} />
                      <label className="custom-control-label" htmlFor="matomoNoCookies">Help improve Remix with anonymous usage data.</label>
                    </div>
                    <a href="#" className="text-info small">Learn more about analytics</a>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Matomo Analytics (with cookies)</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="matomoWithCookies" checked={toggles.matomoWithCookies} onChange={() => handleToggle('matomoWithCookies')} />
                      <label className="custom-control-label" htmlFor="matomoWithCookies">Enable tracking with cookies for more detailed insights.</label>
                    </div>
                    <a href="#" className="text-info small">Manage Cookie Preferences</a>
                  </div>
                </div>
              </div>
            )}
            {selected === 'ai' && (
              <div>
                <h4 className="text-white mb-4">Remix AI Assistant</h4>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">AI Copilot</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="aiCopilot2" checked={toggles.aiCopilot} onChange={() => handleToggle('aiCopilot')} />
                      <label className="custom-control-label" htmlFor="aiCopilot2">Provides AI-powered code suggestions directly in the editor.</label>
                    </div>
                    <a href="#" className="text-info small">Learn more about AI Copilot</a>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Allow AI to Analyze Code Context</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="aiAnalyzeContext" checked={toggles.aiAnalyzeContext} onChange={() => handleToggle('aiAnalyzeContext')} />
                      <label className="custom-control-label" htmlFor="aiAnalyzeContext">Enables deeper insights by analyzing your code structure.</label>
                    </div>
                    <div className="text-warning small">Disabling this may reduce suggestion accuracy.</div>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Use External API for AI Responses</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="aiExternalApi" checked={toggles.aiExternalApi} onChange={() => handleToggle('aiExternalApi')} />
                      <label className="custom-control-label" htmlFor="aiExternalApi">Sends anonymized prompts to OpenAI's API to enhance responses.</label>
                    </div>
                    <div className="text-warning small">Disabling this will limit AI-generated suggestions.</div>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">AI Privacy & Data Usage</h5>
                    <a href="#" className="text-info small">View Privacy Policy</a>
                  </div>
                </div>
              </div>
            )}
            {selected === 'services' && (
              <div>
                <h4 className="text-white mb-4">Connected Services</h4>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Github Credentials</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="githubEnabled" checked={toggles.githubEnabled} onChange={() => handleToggle('githubEnabled')} />
                      <label className="custom-control-label" htmlFor="githubEnabled">Enable Github Integration</label>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label>Token</label>
                        <input type="password" className="form-control" name="githubToken" value={inputs.githubToken} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-4">
                        <label>Username</label>
                        <input type="text" className="form-control" name="githubUsername" value={inputs.githubUsername} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-4">
                        <label>Email</label>
                        <input type="email" className="form-control" name="githubEmail" value={inputs.githubEmail} onChange={handleInput} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm mr-2">Save</button>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">IPFS Settings</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="ipfsEnabled" checked={toggles.ipfsEnabled} onChange={() => handleToggle('ipfsEnabled')} />
                      <label className="custom-control-label" htmlFor="ipfsEnabled">Enable IPFS Integration</label>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-2">
                        <label>Host</label>
                        <input type="text" className="form-control" name="ipfsHost" value={inputs.ipfsHost} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-2">
                        <label>Protocol</label>
                        <input type="text" className="form-control" name="ipfsProtocol" value={inputs.ipfsProtocol} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-2">
                        <label>Port</label>
                        <input type="text" className="form-control" name="ipfsPort" value={inputs.ipfsPort} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-3">
                        <label>Project ID (Infura)</label>
                        <input type="text" className="form-control" name="ipfsProjectId" value={inputs.ipfsProjectId} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-3">
                        <label>Project Secret (Infura)</label>
                        <input type="password" className="form-control" name="ipfsProjectSecret" value={inputs.ipfsProjectSecret} onChange={handleInput} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Save</button>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Swarm Settings</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="swarmEnabled" checked={toggles.swarmEnabled} onChange={() => handleToggle('swarmEnabled')} />
                      <label className="custom-control-label" htmlFor="swarmEnabled">Enable Swarm Integration</label>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label>Private Bee Address</label>
                        <input type="text" className="form-control" name="swarmBee" value={inputs.swarmBee} onChange={handleInput} />
                      </div>
                      <div className="form-group col-md-6">
                        <label>Postage Stamp ID</label>
                        <input type="text" className="form-control" name="swarmStamp" value={inputs.swarmStamp} onChange={handleInput} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Save</button>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Sindri Credentials</h5>
                    <div className="custom-control custom-switch mb-3">
                      <input type="checkbox" className="custom-control-input" id="sindriEnabled" checked={toggles.sindriEnabled} onChange={() => handleToggle('sindriEnabled')} />
                      <label className="custom-control-label" htmlFor="sindriEnabled">Enable Sindri Integration</label>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label>Token</label>
                        <input type="password" className="form-control" name="sindriToken" value={inputs.sindriToken} onChange={handleInput} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// import { ViewPlugin } from '@remixproject/engine-web'
// import React, {useState, useRef, useReducer, useEffect, useCallback} from 'react' // eslint-disable-line
// import { CustomTooltip } from '@remix-ui/helper'
// const _paq = (window._paq = window._paq || [])

// import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
// import { labels, textDark, textSecondary } from './constants'

// import './remix-ui-settings.css'
// import {
//   generateContractMetadat,
//   personal,
//   copilotActivate,
//   copilotMaxNewToken,
//   copilotTemperature,
//   textWrapEventAction,
//   useMatomoPerfAnalytics,
//   saveTokenToast,
//   removeTokenToast,
//   saveSwarmSettingsToast,
//   saveIpfsSettingsToast,
//   useAutoCompletion,
//   useShowGasInEditor,
//   useDisplayErrors,
//   saveEnvState
// } from './settingsAction'
// import { initialState, toastInitialState, toastReducer, settingReducer } from './settingsReducer'
// import {Toaster} from '@remix-ui/toaster' // eslint-disable-line
// import { RemixUiThemeModule, ThemeModule } from '@remix-ui/theme-module'
// import { RemixUiLocaleModule, LocaleModule } from '@remix-ui/locale-module'
// import { FormattedMessage, useIntl } from 'react-intl'
// import { GithubSettings } from './github-settings'
// import { EtherscanSettings } from './etherscan-settings'
// import { SindriSettings } from './sindri-settings'

// /* eslint-disable-next-line */
// export interface RemixUiSettingsProps {
//   plugin: ViewPlugin
//   config: any
//   editor: any
//   _deps: any
//   useMatomoPerfAnalytics: boolean
//   useCopilot: boolean
//   themeModule: ThemeModule
//   localeModule: LocaleModule
// }

// export const RemixUiSettings = (props: RemixUiSettingsProps) => {
//   const [, dispatch] = useReducer(settingReducer, initialState)
//   const [state, dispatchToast] = useReducer(toastReducer, toastInitialState)
//   const [tokenValue, setTokenValue] = useState({}) // eslint-disable-line @typescript-eslint/no-unused-vars
//   const [themeName] = useState('')
//   const [privateBeeAddress, setPrivateBeeAddress] = useState('')
//   const [postageStampId, setPostageStampId] = useState('')
//   const [resetState, refresh] = useState(0)
//   const [ipfsUrl, setipfsUrl] = useState('')
//   const [ipfsPort, setipfsPort] = useState('')
//   const [ipfsProtocol, setipfsProtocol] = useState('')
//   const [ipfsProjectId, setipfsProjectId] = useState('')
//   const [ipfsProjectSecret, setipfsProjectSecret] = useState('')

//   const intl = useIntl()
//   const initValue = () => {
//     const metadataConfig = props.config.get('settings/generate-contract-metadata')
//     if (metadataConfig === undefined || metadataConfig === null) generateContractMetadat(props.config, true, dispatch)

//     const useAutoComplete = props.config.get('settings/auto-completion')
//     if (useAutoComplete === null || useAutoComplete === undefined) useAutoCompletion(props.config, true, dispatch)

//     const displayErrors = props.config.get('settings/display-errors')
//     if (displayErrors === null || displayErrors === undefined) useDisplayErrors(props.config, true, dispatch)

//     const useShowGas = props.config.get('settings/show-gas')
//     if (useShowGas === null || useShowGas === undefined) useShowGasInEditor(props.config, true, dispatch)

//     const enableSaveEnvState = props.config.get('settings/save-evm-state')
//     if (enableSaveEnvState === null || enableSaveEnvState === undefined) saveEnvState(props.config, true, dispatch)
//   }
//   useEffect(() => initValue(), [resetState, props.config])
//   useEffect(() => initValue(), [])

//   useEffect(() => {
//     const token = props.config.get('settings/' + labels['gist'].key)
//     if (token) {
//       setTokenValue((prevState) => {
//         return { ...prevState, gist: token }
//       })
//     }

//     const etherscantoken = props.config.get('settings/' + labels['etherscan'].key)
//     if (etherscantoken) {
//       setTokenValue((prevState) => {
//         return { ...prevState, etherscan: etherscantoken }
//       })
//     }
//     const configPrivateBeeAddress = props.config.get('settings/swarm-private-bee-address')
//     if (configPrivateBeeAddress) {
//       setPrivateBeeAddress(configPrivateBeeAddress)
//     }
//     const configPostageStampId = props.config.get('settings/swarm-postage-stamp-id')
//     if (configPostageStampId) {
//       setPostageStampId(configPostageStampId)
//     }

//     const configipfsUrl = props.config.get('settings/ipfs-url')
//     if (configipfsUrl) {
//       setipfsUrl(configipfsUrl)
//     }
//     const configipfsPort = props.config.get('settings/ipfs-port')
//     if (configipfsPort) {
//       setipfsPort(configipfsPort)
//     }
//     const configipfsProtocol = props.config.get('settings/ipfs-protocol')
//     if (configipfsProtocol) {
//       setipfsProtocol(configipfsProtocol)
//     }
//     const configipfsProjectId = props.config.get('settings/ipfs-project-id')
//     if (configipfsProjectId) {
//       setipfsProjectId(configipfsProjectId)
//     }
//     const configipfsProjectSecret = props.config.get('settings/ipfs-project-secret')
//     if (configipfsProjectSecret) {
//       setipfsProjectSecret(configipfsProjectSecret)
//     }
//   }, [themeName, state.message])

//   useEffect(() => {
//     if (props.useMatomoPerfAnalytics !== null) useMatomoPerfAnalytics(props.config, props.useMatomoPerfAnalytics, dispatch)
//   }, [props.useMatomoPerfAnalytics])

//   const onchangeGenerateContractMetadata = (event) => {
//     generateContractMetadat(props.config, event.target.checked, dispatch)
//   }

//   const textWrapEvent = (event) => {
//     textWrapEventAction(props.config, props.editor, event.target.checked, dispatch)
//   }

//   const onchangeCopilotActivate = () => {
//     if (!props.useCopilot) {
//       copilotActivate(props.config, props.useCopilot, dispatch)
//       return
//     }

//     const startCopilot = async () => {
//       copilotActivate(props.config, props.useCopilot, dispatch)
//     }

//     startCopilot()
//   }

//   useEffect(() => {
//     if (props.useCopilot !== null) copilotActivate(props.config, props.useCopilot, dispatch)
//     onchangeCopilotActivate()
//   }, [props.useCopilot])

//   const onchangeCopilotMaxNewToken = (event) => {
//     copilotMaxNewToken(props.config, parseInt(event.target.value), dispatch)
//   }

//   const onchangeCopilotTemperature = (event) => {
//     copilotTemperature(props.config, parseInt(event.target.value) / 100, dispatch)
//   }

//   const onchangePersonal = (event) => {
//     personal(props.config, event.target.checked, dispatch)
//   }

//   const onchangeMatomoAnalytics = (event) => {
//     useMatomoPerfAnalytics(props.config, event.target.checked, dispatch)
//   }

//   const onchangeUseAutoComplete = (event) => {
//     useAutoCompletion(props.config, event.target.checked, dispatch)
//   }

//   const onchangeShowGasInEditor = (event) => {
//     useShowGasInEditor(props.config, event.target.checked, dispatch)
//   }
//   const onchangeDisplayErrors = (event) => {
//     useDisplayErrors(props.config, event.target.checked, dispatch)
//   }

//   const onchangeSaveEnvState= (event) => {
//     saveEnvState(props.config, event.target.checked, dispatch)
//   }

//   const getTextClass = (key) => {
//     if (props.config.get(key)) {
//       return textDark
//     } else {
//       return textSecondary
//     }
//   }

//   const generalConfig = () => {
//     const isMetadataChecked = props.config.get('settings/generate-contract-metadata') || false
//     const isEditorWrapChecked = props.config.get('settings/text-wrap') || false
//     const isPersonalChecked = props.config.get('settings/personal-mode') || false
//     const isMatomoChecked = props.config.get('settings/matomo-perf-analytics') || false

//     const isAutoCompleteChecked = props.config.get('settings/auto-completion') || false
//     const isShowGasInEditorChecked = props.config.get('settings/show-gas') || false
//     const displayErrorsChecked = props.config.get('settings/display-errors') || false
//     const isSaveEvmStateChecked = props.config.get('settings/save-evm-state') || false
//     return (
//       <div className="$border-top">
//         <div className="d-flex justify-content-end pr-4">
//           <button
//             className="btn btn-sm btn-secondary ml-2"
//             onClick={() => {
//               try {
//                 if ((window as any).remixFileSystem.name === 'indexedDB') {
//                   props.config.clear()
//                   try {
//                     localStorage.clear() // remove the whole storage
//                   } catch (e) {
//                     console.log(e)
//                   }
//                 } else {
//                   props.config.clear() // remove only the remix settings
//                 }
//                 refresh(resetState + 1)
//               } catch (e) {
//                 console.log(e)
//               }
//             }}
//           >
//             <FormattedMessage id="settings.reset" />
//           </button>
//         </div>
//         <div className="card-body pt-3 pb-2">
//           <h6 className="card-title">
//             <FormattedMessage id="settings.general" />
//           </h6>
//           <div className="mt-2 custom-control custom-checkbox mb-1">
//             <input
//               onChange={onchangeGenerateContractMetadata}
//               id="generatecontractmetadata"
//               data-id="settingsTabGenerateContractMetadata"
//               type="checkbox"
//               className="custom-control-input"
//               name="contractMetadata"
//               checked={isMetadataChecked}
//             />
//             <label
//               className={`form-check-label custom-control-label align-middle ${getTextClass('settings/generate-contract-metadata')}`}
//               data-id="settingsTabGenerateContractMetadataLabel"
//               htmlFor="generatecontractmetadata"
//             >
//               <FormattedMessage id="settings.generateContractMetadataText" />
//               <CustomTooltip
//                 placement="auto"
//                 tooltipId="settings-tooltip-metadata"
//                 tooltipText={intl.formatMessage({ id: 'settings.generateContractMetadataTooltip' })}
//               >
//                 <i className="ml-1 far fa-info-circle"></i>
//               </CustomTooltip>
//             </label>
//           </div>
//           <div className="mt-2 custom-control custom-checkbox mb-1">
//             <input id="editorWrap" className="custom-control-input" type="checkbox" onChange={textWrapEvent} checked={isEditorWrapChecked} />
//             <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/text-wrap')}`} htmlFor="editorWrap">
//               <FormattedMessage id="settings.wordWrapText" />
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangeUseAutoComplete} id="settingsUseAutoComplete" type="checkbox" className="custom-control-input" checked={isAutoCompleteChecked} />
//             <label
//               className={`form-check-label custom-control-label align-middle ${getTextClass('settings/auto-completion')}`}
//               data-id="settingsAutoCompleteLabel"
//               htmlFor="settingsUseAutoComplete"
//             >
//               <span>
//                 <FormattedMessage id="settings.useAutoCompleteText" />
//               </span>
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangeShowGasInEditor} id="settingsUseShowGas" type="checkbox" className="custom-control-input" checked={isShowGasInEditorChecked} />
//             <label
//               className={`form-check-label custom-control-label align-middle ${getTextClass('settings/show-gas')}`}
//               data-id="settingsShowGasLabel"
//               htmlFor="settingsUseShowGas"
//             >
//               <span>
//                 <FormattedMessage id="settings.useShowGasInEditorText" />
//               </span>
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangeDisplayErrors} id="settingsDisplayErrors" type="checkbox" className="custom-control-input" checked={displayErrorsChecked} />
//             <label
//               className={`form-check-label custom-control-label align-middle ${getTextClass('settings/display-errors')}`}
//               data-id="displayErrorsLabel"
//               htmlFor="settingsDisplayErrors"
//             >
//               <span>
//                 <FormattedMessage id="settings.displayErrorsText" />
//               </span>
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangePersonal} id="personal" type="checkbox" className="custom-control-input" checked={isPersonalChecked} />
//             <label className={`form-check-label custom-control-label align-middle ${getTextClass('settings/personal-mode')}`} htmlFor="personal">
//               <FormattedMessage id="settings.enablePersonalModeText" />
//               <CustomTooltip
//                 placement="auto"
//                 tooltipId="settings-tooltip-personalMode"
//                 tooltipText={intl.formatMessage({ id: 'settings.enablePersonalModeTooltip' })}
//               >
//                 <i className="ml-1 fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>
//               </CustomTooltip>
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangeMatomoAnalytics} id="settingsMatomoPerfAnalytics" type="checkbox" className="custom-control-input" checked={isMatomoChecked} />
//             <label data-id="label-matomo-settings" className={`form-check-label custom-control-label align-middle ${getTextClass('settings/matomo-perf-analytics')}`} htmlFor="settingsMatomoPerfAnalytics">
//               <span>
//                 <FormattedMessage id="settings.matomoPerfAnalytics" />
//               </span>
//             </label>
//           </div>
//           <div className="custom-control custom-checkbox mb-1">
//             <input onChange={onchangeSaveEnvState} id="settingsEnableSaveEnvState" data-id="settingsEnableSaveEnvState" type="checkbox" className="custom-control-input" checked={isSaveEvmStateChecked} />
//             <label
//               className={`form-check-label custom-control-label align-middle ${getTextClass('settings/save-evm-state')}`}
//               data-id="settingsEnableSaveEnvStateLabel"
//               htmlFor="settingsEnableSaveEnvState"
//             >
//               <span>
//                 <FormattedMessage id="settings.enableSaveEnvState" />
//               </span>
//             </label>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // swarm settings
//   const handleSavePrivateBeeAddress = useCallback(
//     (event) => {
//       setPrivateBeeAddress(event.target.value)
//     },
//     [privateBeeAddress]
//   )

//   const handleSavePostageStampId = useCallback(
//     (event) => {
//       setPostageStampId(event.target.value)
//     },
//     [postageStampId]
//   )

//   const saveSwarmSettings = () => {
//     saveSwarmSettingsToast(props.config, dispatchToast, privateBeeAddress, postageStampId)
//   }

//   const swarmSettings = () => (
//     <div className="border-top">
//       <div className="card-body pt-3 pb-2">
//         <h6 className="card-title">
//           <FormattedMessage id="settings.swarm" />
//         </h6>
//         <div className="pt-2 pt-2 mb-0 pb-0">
//           <label className="m-0">
//             <FormattedMessage id="settings.privateBeeAddress" />:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input id="swarmprivatebeeaddress" data-id="settingsPrivateBeeAddress" className="form-control" onChange={handleSavePrivateBeeAddress} value={privateBeeAddress} />
//           </div>
//         </div>
//         <div className="pt-2 mb-0 pb-0">
//           <label className="m-0">
//             <FormattedMessage id="settings.postageStampID" />:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input id="swarmpostagestamp" data-id="settingsPostageStampId" className="form-control" onChange={handleSavePostageStampId} value={postageStampId} />
//             <div className="d-flex justify-content-end pt-2"></div>
//           </div>
//         </div>
//         <div className="d-flex justify-content-end pt-2">
//           <input
//             className="btn btn-sm btn-primary ml-2"
//             id="saveswarmsettings"
//             data-id="settingsTabSaveSwarmSettings"
//             onClick={() => saveSwarmSettings()}
//             value={intl.formatMessage({ id: 'settings.save' })}
//             type="button"
//             disabled={privateBeeAddress === ''}
//           ></input>
//         </div>
//       </div>
//     </div>
//   )

//   // ipfs settings

//   const handleSaveIpfsProjectId = useCallback(
//     (event) => {
//       setipfsProjectId(event.target.value)
//     },
//     [ipfsProjectId]
//   )

//   const handleSaveIpfsSecret = useCallback(
//     (event) => {
//       setipfsProjectSecret(event.target.value)
//     },
//     [ipfsProjectSecret]
//   )

//   const handleSaveIpfsUrl = useCallback(
//     (event) => {
//       setipfsUrl(event.target.value)
//     },
//     [ipfsUrl]
//   )

//   const handleSaveIpfsPort = useCallback(
//     (event) => {
//       setipfsPort(event.target.value)
//     },
//     [ipfsPort]
//   )

//   const handleSaveIpfsProtocol = useCallback(
//     (event) => {
//       setipfsProtocol(event.target.value)
//     },
//     [ipfsProtocol]
//   )

//   const saveIpfsSettings = () => {
//     saveIpfsSettingsToast(props.config, dispatchToast, ipfsUrl, ipfsProtocol, ipfsPort, ipfsProjectId, ipfsProjectSecret)
//   }

//   const isCopilotActivated = props.config.get('settings/copilot/suggest/activate') || false
//   let copilotMaxnewToken = props.config.get('settings/copilot/suggest/max_new_tokens')
//   if (!copilotMaxnewToken) {
//     props.config.set('settings/copilot/suggest/max_new_tokens', 10)
//     copilotMaxnewToken = 10
//   }
//   let copilotTemperatureValue = (props.config.get('settings/copilot/suggest/temperature')) * 100
//   if (!copilotTemperatureValue) {
//     props.config.set('settings/copilot/suggest/temperature', 0.9)
//     copilotTemperatureValue = 0.9
//   }

//   const ipfsSettings = () => (
//     <div className="border-top">
//       <div className="card-body pt-3 pb-2">
//         <h6 className="card-title">
//           <FormattedMessage id="settings.ipfs" />
//         </h6>
//         <div className="pt-2 mb-0">
//           <label className="m-0">
//             IPFS <FormattedMessage id="settings.host" />:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input placeholder="e.g. ipfs.infura.io" id="settingsIpfsUrl" data-id="settingsIpfsUrl" className="form-control" onChange={handleSaveIpfsUrl} value={ipfsUrl} />
//           </div>
//         </div>
//         <div className="pt-2 mb-0 pb-0">
//           <label className="m-0">
//             IPFS <FormattedMessage id="settings.protocol" />:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input
//               placeholder="e.g. https"
//               id="settingsIpfsProtocol"
//               data-id="settingsIpfsProtocol"
//               className="form-control"
//               onChange={handleSaveIpfsProtocol}
//               value={ipfsProtocol}
//             />
//           </div>
//         </div>
//         <div className="pt-2 mb-0 pb-0">
//           <label className="m-0">
//             IPFS <FormattedMessage id="settings.port" />:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input placeholder="e.g. 5001" id="settingsIpfsPort" data-id="settingsIpfsPort" className="form-control" onChange={handleSaveIpfsPort} value={ipfsPort} />
//           </div>
//         </div>
//         <div className="pt-2 mb-0 pb-0">
//           <label className="m-0">
//             IPFS <FormattedMessage id="settings.projectID" /> [ INFURA ]:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input id="settingsIpfsProjectId" data-id="settingsIpfsProjectId" className="form-control" onChange={handleSaveIpfsProjectId} value={ipfsProjectId} />
//           </div>
//         </div>
//         <div className="pt-2 mb-0 pb-0">
//           <label className="m-0">
//             IPFS <FormattedMessage id="settings.projectSecret" /> [ INFURA ]:
//           </label>
//           <div className="text-secondary mb-0 h6">
//             <input
//               id="settingsIpfsProjectSecret"
//               data-id="settingsIpfsProjectSecret"
//               className="form-control"
//               type="password"
//               onChange={handleSaveIpfsSecret}
//               value={ipfsProjectSecret}
//             />
//           </div>
//         </div>
//         <div className="d-flex justify-content-end pt-2">
//           <input
//             className="btn btn-sm btn-primary ml-2"
//             id="saveIpfssettings"
//             data-id="settingsTabSaveIpfsSettings"
//             onClick={() => saveIpfsSettings()}
//             value={intl.formatMessage({ id: 'settings.save' })}
//             type="button"
//           ></input>
//         </div>
//       </div>
//     </div>
//   )

//   return (
//     <div>
//       {state.message ? <Toaster message={state.message} /> : null}
//       {generalConfig()}
//       <GithubSettings
//         saveToken={(githubToken: string, githubUserName: string, githubEmail: string) => {
//           saveTokenToast(props.config, dispatchToast, githubToken, 'gist-access-token')
//           saveTokenToast(props.config, dispatchToast, githubUserName, 'github-user-name')
//           saveTokenToast(props.config, dispatchToast, githubEmail, 'github-email')
//         }}
//         removeToken={() => {
//           removeTokenToast(props.config, dispatchToast, 'gist-access-token')
//           removeTokenToast(props.config, dispatchToast, 'github-user-name')
//           removeTokenToast(props.config, dispatchToast, 'github-email')
//         }}
//         config={props.config}
//       />
//       <EtherscanSettings
//         saveToken={(etherscanToken: string) => {
//           saveTokenToast(props.config, dispatchToast, etherscanToken, 'etherscan-access-token')
//         }}
//         removeToken={() => {
//           removeTokenToast(props.config, dispatchToast, 'etherscan-access-token')
//         }}
//         config={props.config}
//       />
//       <SindriSettings
//         saveToken={(sindriToken: string) => {
//           saveTokenToast(props.config, dispatchToast, sindriToken, 'sindri-access-token')
//         }}
//         removeToken={() => {
//           removeTokenToast(props.config, dispatchToast, 'sindri-access-token')
//         }}
//         config={props.config}
//       />
//       {swarmSettings()}
//       {ipfsSettings()}
//       <RemixUiThemeModule themeModule={props._deps.themeModule} />
//       <RemixUiLocaleModule localeModule={props._deps.localeModule} />
//     </div>
//   )
// }

