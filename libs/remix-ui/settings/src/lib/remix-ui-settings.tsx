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
import { SettingsSectionUI } from './settings-section'
import { SettingsSection } from '../types'
import { IPFSSettings } from './ipfs-settings'
import { SwarmSettings } from './swarm-settings'

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
          description: 'Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.',
          type: 'toggle'
        }, {
          label: 'Enable code completion in editor',
          type: 'toggle'
        }, {
          label: 'Display gas estimates in editor',
          type: 'toggle'
        }, {
          label: 'Display errors in editor while typing',
          type: 'toggle'
        }, {
          label: 'Enable Personal Mode for web3 provider',
          labelIcon: 'fa fa-exclamation-triangle text-warning',
          type: 'toggle'
        }, {
          label: 'Save environment state',
          type: 'toggle'
        }]
      },
      {
        title: 'Appearance',
        options: [{
          label: 'Language',
          type: 'select',
          selectOptions: [{
            label: 'English',
            value: 'English'
          }]
        }, {
          label: 'Theme',
          type: 'select',
          selectOptions: [{
            label: 'Dark',
            value: 'Dark'
          }, {
            label: 'Light',
            value: 'Light'
          }]
        }]
      }
    ]
  },
  { key: 'analytics', label: 'Analytics', decription: 'Control how Remix uses AI and analytics to improve your experience.', subSections: [
    { options: [{
      label: 'AI Copilot',
      type: 'toggle',
      description: 'AI Copilot assists with code suggestions and improvements.',
      footnote: {
        text: 'Learn more about AI Copilot',
        link: 'https://remix.ethereum.org/',
        styleClass: 'text-primary'
      }
    }, {
      label: 'Matomo Analytics (no cookies)',
      type: 'toggle',
      description: 'Help improve Remix with anonymous usage data.',
      footnote: {
        text: 'Learn more about analytics',
        link: 'https://remix.ethereum.org/',
        styleClass: 'text-primary'
      }
    }, {
      label: 'Matomo Analytics (with cookies)',
      type: 'toggle',
      description: 'Enable tracking with cookies for more detailed insights.',
      footnote: {
        text: 'Manage Cookie Preferences',
        link: 'https://remix.ethereum.org/',
        styleClass: 'text-primary'
      }
    }]
    }
  ]},
  { key: 'ai', label: 'Remix AI Assistant', decription: 'The Remix AI Assistant enhances your coding experience with smart suggestions and automated insights. Manage how AI interacts with your code and data.', subSections: [
    {
      options: [{
        label: 'AI Copilot',
        description: 'AI Copilot assists with code suggestions and improvements.',
        type: 'toggle',
        footnote: {
          text: 'Learn more about AI Copilot',
          link: 'https://remix.ethereum.org/',
          styleClass: 'text-primary'
        }
      },{
        label: 'Allow AI to Analyze Code Context',
        description: 'Enables deeper insights by analyzing your code structure.',
        type: 'toggle',
        footnote: {
          text: 'Disabling this may reduce suggestion accuracy.',
          styleClass: 'text-warning'
        }
      },{
        label: 'Use External API for AI Responses',
        description: 'Sends anonymized prompts to OpenAI\'s API to enhance responses.',
        type: 'toggle',
        footnote: {
          text: 'Disabling this will limit AI-generated suggestions.',
          styleClass: 'text-warning'
        }
      },{
        label: 'View Privacy Policy',
        description: 'Understand how AI processes your data.',
        type: 'button'
      }]
    }
  ]},
  { key: 'services', label: 'Connected Services', decription: 'Configure the settings for connected services, including Github, IPFS, Swarm, Sidri and Etherscan.', subSections: [
    {
      options: [{
        label: 'Github Credentials',
        type: 'toggle',
        toggleOptions: <GithubSettings
          saveToken={(githubToken: string, githubUserName: string, githubEmail: string) => {
            // saveTokenToast(props.config, dispatchToast, githubToken, 'gist-access-token')
            // saveTokenToast(props.config, dispatchToast, githubUserName, 'github-user-name')
            // saveTokenToast(props.config, dispatchToast, githubEmail, 'github-email')
          }}
          removeToken={() => {
            // removeTokenToast(props.config, dispatchToast, 'gist-access-token')
            // removeTokenToast(props.config, dispatchToast, 'github-user-name')
            // removeTokenToast(props.config, dispatchToast, 'github-email')
          }}
          config={{
            exists: () => true,
            get: () => '',
            set: () => {},
            clear: () => {},
            getUnpersistedProperty: () => {},
            setUnpersistedProperty: () => {}
          }}
        />
      }, {
        label: 'IPFS Settings',
        type: 'toggle',
        toggleOptions: <IPFSSettings />
      }, {
        label: 'Swarm Settings',
        type: 'toggle',
        toggleOptions: <SwarmSettings />
      }, {
        label: 'Sindri Credentials',
        type: 'toggle',
        toggleOptions: <SindriSettings
          saveToken={(sindriToken: string) => {
            // saveTokenToast(props.config, dispatchToast, sindriToken, 'sindri-access-token')
          }}
          removeToken={() => {
            // removeTokenToast(props.config, dispatchToast, 'sindri-access-token')
          }}
          config={{
            exists: () => true,
            get: () => '',
            set: () => {},
            clear: () => {},
            getUnpersistedProperty: () => {},
            setUnpersistedProperty: () => {}
          }}
        />
      }]
    }
  ]},
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
            <input type="text" className="form-control shadow-none" placeholder="Search settings" style={{ minWidth: '200px', height: '40px', maxWidth: '515px' }} />
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
          <div className="pt-4 px-5" style={{ maxWidth: '650px' }}>
            <div className="mt-4">
              { settingsSections.map((section) => (selected === section.key && <SettingsSectionUI key={section.key} section={section} />))}
            </div>
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

