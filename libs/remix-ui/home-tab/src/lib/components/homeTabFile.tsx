/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer } from 'react'
import { FormattedMessage } from 'react-intl'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
const _paq = window._paq = window._paq || [] // eslint-disable-line
import { CustomTooltip } from '@remix-ui/helper';

interface  HomeTabFileProps {
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

function HomeTabFile ({plugin}: HomeTabFileProps) {
  const [state, setState] = useState<{
    searchInput: string,
    showModalDialog: boolean,
    modalInfo: { title: string, loadItem: string, examples: Array<string>, prefix?: string },
    importSource: string,
    toasterMsg: string
  }>({
    searchInput: '',
    showModalDialog: false,
    modalInfo: { title: '', loadItem: '', examples: [], prefix: '' },
    importSource: '',
    toasterMsg: ''
  })

  const [, dispatch] = useReducer(loadingReducer, loadingInitialState)

  const inputValue = useRef(null)

  const processLoading = (type: string) => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'importFrom' + type])
    const contentImport = plugin.contentImport
    const workspace = plugin.fileManager.getProvider('workspace')
    const startsWith = state.importSource.substring(0, 4)

    if ((type === 'ipfs' || type === 'IPFS') && (startsWith !== 'ipfs' && startsWith !== "IPFS")) {
      setState(prevState => {
        return { ...prevState, importSource: startsWith + state.importSource}
      })
    }
    contentImport.import(
      state.modalInfo.prefix + state.importSource,
      (loadingMsg) => dispatch({ tooltip: loadingMsg }),
      async (error, content, cleanUrl, type, url) => {
        if (error) {
          toast(error.message || error)
        } else {
          try {
            if (await workspace.exists(type + '/' + cleanUrl)) toast('File already exists in workspace')
            else {
              workspace.addExternal(type + '/' + cleanUrl, content, url)
              plugin.call('menuicons', 'select', 'filePanel')
            }
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

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const createNewFile = async () => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'createNewFile'])
    plugin.verticalIcons.select('filePanel')
    await plugin.call('filePanel', 'createNewFile')
  }

  const uploadFile = async (target) => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'uploadFile'])
    await plugin.call('filePanel', 'uploadFile', target)
  }

  const connectToLocalhost = () => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'connectToLocalhost'])
    plugin.appManager.activatePlugin('remixd')
  }
  const importFromGist = () => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'importFromGist'])
    plugin.call('gistHandler', 'load', '')
    plugin.verticalIcons.select('filePanel')
  }

  const showFullMessage = (title: string, loadItem: string, examples: Array<string>, prefix = '') => {
    setState(prevState => {
      return { ...prevState, showModalDialog: true, modalInfo: { title: title, loadItem: loadItem, examples: examples, prefix } }
    })
  }

  const hideFullMessage = () => { //eslint-disable-line
    setState(prevState => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const examples = state.modalInfo.examples.map((urlEl, key) => (<div key={key} className="p-1 user-select-auto"><a>{urlEl}</a></div>))

  return (
    <>
      <ModalDialog
        id='homeTab'
        title={ 'Import from ' + state.modalInfo.title }
        okLabel='Import'
        hide={ !state.showModalDialog }
        handleHide={ () => hideFullMessage() }
        okFn={ () => processLoading(state.modalInfo.title) }
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
          <div className="d-flex flex-row">
            { state.modalInfo.prefix && <span className='text-nowrap align-self-center mr-2'>ipfs://</span> }
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
        </div>
      </ModalDialog>
      <Toaster message={state.toasterMsg} />
      <div className="justify-content-start mt-1 p-2 d-flex flex-column" id="hTFileSection">
        <label style={{fontSize: "1.2rem"}}><FormattedMessage id='home.files' /></label>
        <div className="dflex">
          <button className="btn btn-primary p-2 mr-2 border my-1" data-id="homeTabNewFile" style={{width: 'fit-content'}} onClick={() => createNewFile()}><FormattedMessage id='home.newFile' /></button>
          <label className="btn p-2 mr-2 border my-1" style={{width: 'fit-content', cursor: 'pointer'}} htmlFor="openFileInput"><FormattedMessage id='home.openFile' /></label>
          <input title="open file" type="file" id="openFileInput" onChange={(event) => {
            event.stopPropagation()
            plugin.verticalIcons.select('filePanel')
            uploadFile(event.target)
          }} multiple />
          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={"Connect to Localhost"}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button className="btn p-2 border my-1" style={{width: 'fit-content'}} onClick={() => connectToLocalhost()}><FormattedMessage id='home.connectToLocalhost' /></button>
          </CustomTooltip>
        </div>
        <label style={{fontSize: "0.8rem"}} className="pt-2"><FormattedMessage id='home.loadFrom' /></label>
        <div className="d-flex">
          <button
            className="btn p-2 border mr-2"
            data-id="landingPageImportFromGitHubButton"
            onClick={() => showFullMessage('GitHub', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol'])}
          >
            GitHub
          </button>
          <button className="btn p-2 border mr-2" data-id="landingPageImportFromGistButton" onClick={() => importFromGist()}>Gist</button>
          <button className="btn p-2 border mr-2" onClick={() => showFullMessage('Ipfs', 'ipfs hash', ['ipfs://QmQQfBMkpDgmxKzYaoAtqfaybzfgGm9b2LWYyT56Chv6xH'], "ipfs://")}>IPFS</button> 
          <button className="btn p-2 border" onClick={() => showFullMessage('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol'])}>HTTPS</button>
        </div>
      </div>
    </>
  )
}

export default HomeTabFile
