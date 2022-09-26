/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line

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
    modalInfo: { title: string, loadItem: string, examples: Array<string> },
    importSource: string,
    toasterMsg: string
  }>({
    searchInput: '',
    showModalDialog: false,
    modalInfo: { title: '', loadItem: '', examples: [] },
    importSource: '',
    toasterMsg: ''
  })

  const [, dispatch] = useReducer(loadingReducer, loadingInitialState)

  const inputValue = useRef(null)

  const processLoading = () => {
    const contentImport = plugin.contentImport
    const workspace = plugin.fileManager.getProvider('workspace')
    contentImport.import(
      state.importSource,
      (loadingMsg) => dispatch({ tooltip: loadingMsg }),
      async (error, content, cleanUrl, type, url) => {
        if (error) {
          toast(error.message || error)
        } else {
          try {
            if (await workspace.exists(type + '/' + cleanUrl)) toast('File already exists in workspace')
            else {
              workspace.addExternal(cleanUrl, content, url)
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

  const examples = state.modalInfo.examples.map((urlEl, key) => (<div key={key} className="p-1 user-select-auto"><a>{urlEl}</a></div>))

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
      <div className="justify-content-start p-2 border-bottom d-flex flex-column" id="hTFileSection">
        <label>Files</label>
        <button className="btn p-2 border my-1" style={{width: 'fit-content'}} onClick={() => createNewFile()}>New File</button>
        <label className="btn p-2 border my-1" style={{width: 'fit-content'}} htmlFor="openFileInput">Open File</label>
        <input title="open file" type="file" id="openFileInput" onChange={(event) => {
          event.stopPropagation()
          plugin.verticalIcons.select('filePanel')
          uploadFile(event.target)
        }} multiple />
        <button className="btn p-2 border my-1" style={{width: 'fit-content'}} onClick={() => connectToLocalhost()}>Connect for Localhost</button>
        <label className="pt-2">Load From</label>
        <div className="d-flex">
          <button className="btn p-2 border mr-2" data-id="landingPageImportFromGitHubButton" onClick={() => showFullMessage('GitHub', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol'])}>GitHub</button>
          <button className="btn p-2 border mr-2" data-id="landingPalandingPageImportFromGistButtongeImportFromGistButton" onClick={() => importFromGist()}>Gist</button>
          <button className="btn p-2 border mr-2" onClick={() => showFullMessage('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>'])}>IPFS</button> 
          <button className="btn p-2 border" onClick={() => showFullMessage('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol'])}>HTTPS</button>
        </div>
      </div>
    </>
  )
}

export default HomeTabFile