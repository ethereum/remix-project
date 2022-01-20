import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line

import './remix-ui-home-tab.css'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import PluginButton from './components/pluginButton' // eslint-disable-line
import QueryParams from '../../../../../apps/remix-ide/src/lib/query-params'
import { ThemeContext, themes } from './themeContext'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || [] //eslint-disable-line

/* eslint-disable-next-line */
export interface RemixUiHomeTabProps {
  plugin: any
}

const loadingInitialState = {
  tooltip: '',
  showModalDialog: false,
  importSource: ''
}

const loadingReducer = (state = loadingInitialState, action) => {
  return { ...state, tooltip: action.tooltip, showModalDialog: false, importSource: '' }
}

export const RemixUiHomeTab = (props: RemixUiHomeTabProps) => {
  const { plugin } = props
  const fileManager = plugin.fileManager

  const [state, setState] = useState<{
    themeQuality: { filter: string, name: string },
    showMediaPanel: 'none' | 'twitter' | 'medium',
    showModalDialog: boolean,
    modalInfo: { title: string, loadItem: string, examples: Array<string> },
    importSource: string,
    toasterMsg: string
  }>({
    themeQuality: themes.light,
    showMediaPanel: 'none',
    showModalDialog: false,
    modalInfo: { title: '', loadItem: '', examples: [] },
    importSource: '',
    toasterMsg: ''
  })

  const processLoading = () => {
    const contentImport = plugin.contentImport
    const workspace = fileManager.getProvider('workspace')
    contentImport.import(
      state.importSource,
      (loadingMsg) => dispatch({ tooltip: loadingMsg }),
      (error, content, cleanUrl, type, url) => {
        if (error) {
          toast(error.message || error)
        } else {
          try {
            workspace.addExternal(type + '/' + cleanUrl, content, url)
            plugin.call('menuicons', 'select', 'filePanel')
          } catch (e) {
            toast(e.message)
          }
        }
      }
    )
    setState(prevState => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const [, dispatch] = useReducer(loadingReducer, loadingInitialState)

  const playRemi = async () => {
    remiAudioEl.current.play()
  }

  const remiAudioEl = useRef(null)
  const inputValue = useRef(null)
  const rightPanel = useRef(null)

  useEffect(() => {
    plugin.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
    plugin.on('theme', 'themeChanged', (theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
    window.addEventListener('click', (event) => {
      const target = event.target as Element
      const id = target.id
      if (id !== 'remixIDEHomeTwitterbtn' && id !== 'remixIDEHomeMediumbtn' && !rightPanel.current.contains(event.target)) {
        // todo check event.target
        setState(prevState => { return { ...prevState, showMediaPanel: 'none' } })
      }
    })
    // to retrieve twitter feed
    const scriptTwitter = document.createElement('script')
    scriptTwitter.src = 'https://platform.twitter.com/widgets.js'
    scriptTwitter.async = true
    document.body.appendChild(scriptTwitter)
    // to retrieve medium publications
    const scriptMedium = document.createElement('script')
    scriptMedium.src = 'https://www.twilik.com/assets/retainable/rss-embed/retainable-rss-embed.js'
    scriptMedium.async = true
    document.body.appendChild(scriptMedium)
    return () => {
      document.body.removeChild(scriptTwitter)
      document.body.removeChild(scriptMedium)
    }
  }, [])

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const createNewFile = async () => {
    plugin.verticalIcons.select('filePanel')
    await plugin.call('filePanel', 'createNewFile')
  }

  const uploadFile = async (target) => {
    await plugin.call('filePanel', 'uploadFile', target)
  }

  const connectToLocalhost = () => {
    plugin.appManager.activatePlugin('remixd')
  }
  const importFromGist = () => {
    plugin.call('gistHandler', 'load', '')
    plugin.verticalIcons.select('filePanel')
  }
  const switchToPreviousVersion = () => {
    const query = new QueryParams()
    query.update({ appVersion: '0.7.7' })
    _paq.push(['trackEvent', 'LoadingType', 'oldExperience_0.7.7'])
    document.location.reload()
  }
  const startSolidity = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'udapp', 'solidityStaticAnalysis', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidity')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solidity'])
  }
  const startCairo = async () => {
    await plugin.appManager.activatePlugin('cairo_compiler')
    plugin.verticalIcons.select('cairo_compiler')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'cairo_compiler'])
  }
  const startSolhint = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solhint'])
    plugin.verticalIcons.select('solhint')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solhint'])
  }
  const startLearnEth = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'LearnEth', 'solidityUnitTesting'])
    plugin.verticalIcons.select('LearnEth')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'learnEth'])
  }
  const startSourceVerify = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'sourcify'])
    plugin.verticalIcons.select('sourcify')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'sourcify'])
  }
  const startPluginManager = async () => {
    plugin.verticalIcons.select('pluginManager')
  }

  const showFullMessage = (title: string, loadItem: string, examples: Array<string>) => {
    setState(prevState => {
      return { ...prevState, showModalDialog: true, modalInfo: { title: title, loadItem: loadItem, examples: examples } }
    })
  }

  const hideFullMessage = () => { //eslint-disable-line
    setState(prevState => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const maxHeight = Math.max(window.innerHeight - 150, 250) + 'px'
  const examples = state.modalInfo.examples.map((urlEl, key) => (<div key={key} className="p-1 user-select-auto"><a>{urlEl}</a></div>))
  const elHeight = '4000px'
  return (
    <>
      <ModalDialog
        id='homeTab'
        title={ 'Import from ' + state.modalInfo.title }
        okLabel='Import'
        hide={ !state.showModalDialog }
        handleHide={ () => hideFullMessage() }
        okFn={ () => processLoading() }
      >
        <div className="p-2 user-select-auto">
          { state.modalInfo.loadItem !== '' && <span>Enter the { state.modalInfo.loadItem } you would like to load.</span> }
          { state.modalInfo.examples.length !== 0 &&
          <>
            <div>e.g</div>
            <div>
              { examples }
            </div>
          </> }
          <input
            ref={inputValue}
            type='text'
            name='prompt_text'
            id='inputPrompt_text'
            className="w-100 mt-1 form-control"
            data-id="homeTabModalDialogCustomPromptText"
            value={state.importSource}
            onInput={(e) => {
              setState(prevState => {
                return { ...prevState, importSource: inputValue.current.value }
              })
            }}
          />
        </div>
      </ModalDialog>
      <Toaster message={state.toasterMsg} />
      <div className="d-flex flex-column ml-4" id="remixUiRightPanel">
        <div className="border-bottom d-flex justify-content-between mr-4 pb-3 mb-3">
          <div className="mx-4 my-4 d-flex">
            <label style={ { fontSize: 'xxx-large', height: 'auto', alignSelf: 'flex-end' } }>Remix IDE</label>
          </div>
          <div className="mr-4 d-flex">
            <img className="mt-4 mb-2 remixui_home_logoImg" src="assets/img/guitarRemiCroped.webp" onClick={ () => playRemi() } alt=""></img>
            <audio
              id="remiAudio"
              muted={false}
              src="assets/audio/remiGuitar-single-power-chord-A-minor.wav"
              ref={remiAudioEl}
            ></audio>
          </div>
        </div>
        <div className="row mx-2 mr-4" data-id="landingPageHpSections">
          <div className="ml-3">
            <div className="mb-5">
              <h4>Featured Plugins</h4>
              <div className="d-flex flex-row pt-2">
                <ThemeContext.Provider value={ state.themeQuality }>
                  <PluginButton imgPath="assets/img/solidityLogo.webp" envID="solidityLogo" envText="Solidity" callback={() => startSolidity()} />
                  <PluginButton imgPath="assets/img/cairoLogo.webp" envID="CairoLogo" envText="Cairo compiler" l2={true} callback={() => startCairo()} />
                  <PluginButton imgPath="assets/img/solhintLogo.webp" envID="solhintLogo" envText="Solhint linter" callback={() => startSolhint()} />
                  <PluginButton imgPath="assets/img/learnEthLogo.webp" envID="learnEthLogo" envText="LearnEth" callback={() => startLearnEth()} />
                  <PluginButton imgPath="assets/img/sourcifyLogo.webp" envID="sourcifyLogo" envText="Sourcify" callback={() => startSourceVerify()} />
                  <PluginButton imgPath="assets/img/moreLogo.webp" envID="moreLogo" envText="More" callback={startPluginManager} />
                </ThemeContext.Provider>
              </div>
            </div>
            <div className="d-flex">
              <div className="file">
                <h4>File</h4>
                <p className="mb-1">
                  <i className="mr-2 far fa-file"></i>
                  <label className="ml-1 mb-1 remixui_home_text" onClick={() => createNewFile()}>New File</label>
                </p>
                <p className="mb-1">
                  <i className="mr-2 far fa-file-alt"></i>
                  <label className="ml-1 remixui_home_labelIt remixui_home_bigLabelSize remixui_home_text" htmlFor="openFileInput">
                    Open Files
                  </label>
                  <input title="open file" type="file" id="openFileInput" onChange={(event) => {
                    event.stopPropagation()
                    plugin.verticalIcons.select('filePanel')
                    uploadFile(event.target)
                  }} multiple />
                </p>
                <p className="mb-1">
                  <i className="mr-1 far fa-hdd"></i>
                  <label className="ml-1 remixui_home_text" onClick={() => connectToLocalhost()}>Connect to Localhost</label>
                </p>
                <p className="mt-3 mb-0"><label>LOAD FROM:</label></p>
                <div className="btn-group">
                  <button className="btn mr-1 btn-secondary" data-id="landingPageImportFromGistButton" onClick={() => importFromGist()}>Gist</button>
                  <button className="btn mx-1 btn-secondary" data-id="landingPageImportFromGitHubButton" onClick={() => showFullMessage('Github', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol'])}>GitHub</button>
                  <button className="btn mx-1 btn-secondary" onClick={() => showFullMessage('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>'])}>Ipfs</button>
                  <button className="btn mx-1 btn-secondary" onClick={() => showFullMessage('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol'])}>https</button>
                </div>
              </div>
              <div className="ml-4 pl-4">
                <h4>Resources</h4>
                <p className="mb-1">
                  <i className="mr-2 fas fa-book"></i>
                  <a className="remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#">Documentation</a>
                </p>
                <p className="mb-1">
                  <i className="mr-2 fab fa-gitter"></i>
                  <a className="remixui_home_text" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a>
                </p>
                <p className="mb-1">
                  <img id='remixHhomeWebsite' className="mr-2 remixui_home_image" src={ plugin.profile.icon } style={ { filter: state.themeQuality.filter } } alt=''></img>
                  <a className="remixui_home_text" target="__blank" href="https://remix-project.org">Featuring website</a>
                </p>
                <p className="mb-1">
                  <i className="mr-2 fab fa-ethereum remixui_home_image"></i>
                  <label className="remixui_home_text" onClick={() => switchToPreviousVersion()}>Old experience</label>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column remixui_home_rightPanel">
          <div className="d-flex pr-3 py-2 align-self-end" id="remixIDEMediaPanelsTitle">
            <button
              className="btn-info p-2 m-1 border rounded-circle remixui_home_mediaBadge fab fa-twitter"
              id="remixIDEHomeTwitterbtn"
              title="Twitter"
              onClick={(e) => {
                setState(prevState => {
                  return { ...prevState, showMediaPanel: state.showMediaPanel === 'twitter' ? 'none' : 'twitter' }
                })
                _paq.push(['trackEvent', 'pluginManager', 'media', 'twitter'])
              }}
            ></button>
            <button
              className="btn-danger p-2 m-1 border rounded-circle remixui_home_mediaBadge fab fa-medium"
              id="remixIDEHomeMediumbtn"
              title="Medium blogs"
              onClick={(e) => {
                setState(prevState => {
                  return { ...prevState, showMediaPanel: state.showMediaPanel === 'medium' ? 'none' : 'medium' }
                })
                _paq.push(['trackEvent', 'pluginManager', 'media', 'medium'])
              }}
            ></button>
          </div>
          <div
            className="mr-3 d-flex bg-light remixui_home_panels"
            style={ { visibility: state.showMediaPanel === 'none' ? 'hidden' : 'visible' } }
            id="remixIDEMediaPanels"
            ref={rightPanel}
          >
            <div id="remixIDE_MediumBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" style={ { maxHeight: maxHeight } }>
              <div id="medium-widget" className="px-3 remixui_home_media" hidden={state.showMediaPanel !== 'medium'} style={ { maxHeight: '10000px' } }>
                <div
                  id="retainable-rss-embed"
                  data-rss="https://medium.com/feed/remix-ide"
                  data-maxcols="1"
                  data-layout="grid"
                  data-poststyle="external"
                  data-readmore="More..."
                  data-buttonclass="btn mb-3"
                  data-offset="-100"
                >
                </div>
              </div>
            </div>
            <div id="remixIDE_TwitterBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" hidden={state.showMediaPanel !== 'twitter'} style={ { maxHeight: maxHeight, marginRight: '28px' } } >
              <div className="remixui_home_media" style={ { minHeight: elHeight } } >
                <a className="twitter-timeline"
                  data-width="375"
                  data-theme={ state.themeQuality.name }
                  data-chrome="nofooter noheader transparent"
                  data-tweet-limit="18"
                  href="https://twitter.com/EthereumRemix"
                >
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RemixUiHomeTab
