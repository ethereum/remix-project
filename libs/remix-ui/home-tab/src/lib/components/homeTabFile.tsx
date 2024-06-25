/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import {ModalDialog} from '@remix-ui/modal-dialog' // eslint-disable-line
import {Toaster} from '@remix-ui/toaster' // eslint-disable-line
const _paq = (window._paq = window._paq || []) // eslint-disable-line
import { CustomTooltip } from '@remix-ui/helper'
import { TEMPLATE_NAMES } from '@remix-ui/workspace'

interface HomeTabFileProps {
  plugin: any
}

const loadingInitialState = {
  tooltip: '',
  showModalDialog: false,
  importSource: '',
}

const loadingReducer = (state = loadingInitialState, action) => {
  return {
    ...state,
    tooltip: action.tooltip,
    showModalDialog: false,
    importSource: '',
  }
}

function HomeTabFile({ plugin }: HomeTabFileProps) {
  const [state, setState] = useState<{
    searchInput: string
    showModalDialog: boolean
    modalInfo: {
      title: string
      loadItem: string
      examples: Array<string>
      prefix?: string
    }
    importSource: string
    toasterMsg: string
    recentWorkspaces: Array<string>
  }>({
    searchInput: '',
    showModalDialog: false,
    modalInfo: { title: '', loadItem: '', examples: [], prefix: '' },
    importSource: '',
    toasterMsg: '',
    recentWorkspaces: [],
  })

  const [, dispatch] = useReducer(loadingReducer, loadingInitialState)

  const inputValue = useRef(null)

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', async () => {
      let recents = JSON.parse(localStorage.getItem('recentWorkspaces'))

      if (!recents) {
        recents = []
      } else {
        setState((prevState) => {
          return { ...prevState, recentWorkspaces: recents.slice(0, recents.length <= 3 ? recents.length : 3) }
        })
      }
    })

    const deleteSavedWorkspace = (name) => {
      const recents = JSON.parse(localStorage.getItem('recentWorkspaces'))
      let newRecents = recents
      if (!recents) {
        newRecents = []
      } else {
        newRecents = recents.filter((el) => {
          return el !== name
        })
        localStorage.setItem('recentWorkspaces', JSON.stringify(newRecents))
      }
      setState((prevState) => {
        return { ...prevState, recentWorkspaces: newRecents.slice(0, newRecents.length <= 3 ? newRecents.length : 3) }
      })
    }
    plugin.on('filePanel', 'workspaceDeleted', async (deletedName) => {
      deleteSavedWorkspace(deletedName)
    })
    return () => {
      try {
        plugin.off('filePanel', 'setWorkspace')
        plugin.off('filePanel', 'workspaceDeleted')
      } catch (e) {}
    }
  }, [plugin])

  const processLoading = (type: string) => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'importFrom' + type])
    const contentImport = plugin.contentImport
    const workspace = plugin.fileManager.getProvider('workspace')
    const startsWith = state.importSource.substring(0, 4)

    if ((type === 'ipfs' || type === 'IPFS') && startsWith !== 'ipfs' && startsWith !== 'IPFS') {
      setState((prevState) => {
        return { ...prevState, importSource: startsWith + state.importSource }
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
    setState((prevState) => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const toast = (message: string) => {
    setState((prevState) => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const startCoding = async () => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'startCoding'])
    plugin.verticalIcons.select('filePanel')

    const wName = 'Playground'
    const workspaces = await plugin.call('filePanel', 'getWorkspaces')
    let createFile = true
    if (!workspaces.find((workspace) => workspace.name === wName)) {
      await plugin.call('filePanel', 'createWorkspace', wName, 'playground')
      createFile = false
    }
    await plugin.call('filePanel', 'switchToWorkspace', { name: wName, isLocalHost: false })
    await plugin.call('filePanel', 'switchToWorkspace', { name: wName, isLocalHost: false }) // calling once is not working.
    const content = `// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

contract HelloWorld {
  /**
   * @dev Prints Hello World string
   */
  function print() public pure returns (string memory) {
    return "Hello World!";
  }
}
      `
    if (createFile) {
      const { newPath } = await plugin.call('fileManager', 'writeFileNoRewrite', '/contracts/HelloWorld.sol', content)
      await plugin.call('fileManager', 'open', newPath)
    } else {
      await plugin.call('fileManager', 'open', '/contracts/HelloWorld.sol')
    }
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
    setState((prevState) => {
      return {
        ...prevState,
        showModalDialog: true,
        modalInfo: {
          title: title,
          loadItem: loadItem,
          examples: examples,
          prefix,
        },
      }
    })
  }

  const hideFullMessage = () => {
    //eslint-disable-line
    setState((prevState) => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const handleSwichToRecentWorkspace = async (e, workspaceName) => {
    e.preventDefault()
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'loadRecentWorkspace'])
    await plugin.call('filePanel', 'switchToWorkspace', { name: workspaceName, isLocalhost: false })
  }

  const examples = state.modalInfo.examples.map((urlEl, key) => (
    <div key={key} className="p-1 user-select-auto">
      <a>{urlEl}</a>
    </div>
  ))

  return (
    <>
      <ModalDialog id="homeTab" title={'Import from ' + state.modalInfo.title} okLabel="Import" hide={!state.showModalDialog} handleHide={() => hideFullMessage()} okFn={() => processLoading(state.modalInfo.title)}>
        <div className="p-2 user-select-auto">
          {state.modalInfo.loadItem !== '' && <span>Enter the {state.modalInfo.loadItem} you would like to load.</span>}
          {state.modalInfo.examples.length !== 0 && (
            <>
              <div>e.g</div>
              <div>{examples}</div>
            </>
          )}
          <div className="d-flex flex-row">
            {state.modalInfo.prefix && <span className="text-nowrap align-self-center mr-2">ipfs://</span>}
            <input
              ref={inputValue}
              type="text"
              name="prompt_text"
              id="inputPrompt_text"
              className="w-100 mt-1 form-control"
              data-id="homeTabModalDialogCustomPromptText"
              value={state.importSource}
              onInput={(e) => {
                setState((prevState) => {
                  return { ...prevState, importSource: inputValue.current.value }
                })
              }}
            />
          </div>
        </div>
      </ModalDialog>
      <Toaster message={state.toasterMsg} />
      <div className="justify-content-start mt-1 p-2 d-flex flex-column" id="hTFileSection">
        <div className="mb-3">
          {(state.recentWorkspaces[0] || state.recentWorkspaces[1] || state.recentWorkspaces[2]) && (
            <div className="d-flex flex-column mb-5 remixui_recentworkspace">
              <label style={{ fontSize: '0.8rem' }} className="mt-3">
              Recent Workspaces
              </label>
              {state.recentWorkspaces[0] && state.recentWorkspaces[0] !== '' && (
                <a className="cursor-pointer mb-1 ml-2" href="#" onClick={(e) => handleSwichToRecentWorkspace(e, state.recentWorkspaces[0])}>
                  {state.recentWorkspaces[0]}
                </a>
              )}
              {state.recentWorkspaces[1] && state.recentWorkspaces[1] !== '' && (
                <a className="cursor-pointer mb-1 ml-2" href="#" onClick={(e) => handleSwichToRecentWorkspace(e, state.recentWorkspaces[1])}>
                  {state.recentWorkspaces[1]}
                </a>
              )}
              {state.recentWorkspaces[2] && state.recentWorkspaces[2] !== '' && (
                <a className="cursor-pointer ml-2" href="#" onClick={(e) => handleSwichToRecentWorkspace(e, state.recentWorkspaces[2])}>
                  {state.recentWorkspaces[2]}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="d-flex flex-column flex-nowrap pt-3">
          <label style={{ fontSize: '1.2rem' }}>
            <FormattedMessage id="home.files" />
          </label>
          <div className="d-flex flex-column">
            <div className="d-flex flex-row">
              <CustomTooltip placement={'top'} tooltipId="overlay-tooltip" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="home.startCodingPlayground" />} tooltipTextClasses="border bg-light text-dark p-1 pr-3">
                <button className="btn btn-primary text-nowrap p-2 mr-2 border my-1" data-id="homeTabNewFile" style={{ width: 'fit-content' }} onClick={async () => await plugin.call('filePanel', 'createNewFile')}>
                  <FormattedMessage id="home.newFile" />
                </button>
              </CustomTooltip>
              <CustomTooltip placement={'top'} tooltipId="overlay-tooltip" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="home.openFileTooltip" />} tooltipTextClasses="border bg-light text-dark p-1 pr-3">
                <span>
                  <label className="btn text-nowrap p-2 mr-2 border my-1" style={{ width: 'fit-content', cursor: 'pointer' }} htmlFor="openFileInput">
                    <FormattedMessage id="home.openFile" />
                  </label>
                  <input
                    title="open file"
                    type="file"
                    id="openFileInput"
                    onChange={(event) => {
                      event.stopPropagation()
                      plugin.verticalIcons.select('filePanel')
                      uploadFile(event.target)
                    }}
                    multiple
                  />
                </span>
              </CustomTooltip>
              <button className="btn text-nowrap p-2 mr-2 border my-1" onClick={() => showFullMessage('Ipfs', 'ipfs hash', ['ipfs://QmQQfBMkpDgmxKzYaoAtqfaybzfgGm9b2LWYyT56Chv6xH'], 'ipfs://')}>
              IPFS
              </button>
              <button className="btn text-nowrap p-2 mr-2 border my-1" data-id="landingPageImportFromGitHubButton" onClick={() => showFullMessage('GitHub', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol'])}>
              Git Clone
              </button>
              <button className="btn text-nowrap p-2 mr-2 border my-1" data-id="landingPageImportFromGistButton" onClick={() => importFromGist()}>
            Gist
              </button>

              <button
                className="btn text-nowrap p-2 mr-2 border my-1"
                onClick={() =>
                  showFullMessage('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol'])
                }
              >
            HTTPS
              </button>
            </div>
          </div>
          <div className="d-flex mt-2 align-items-end w-100">
            <CustomTooltip placement={'top'} tooltipId="overlay-tooltip" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="home.connectToLocalhost" />} tooltipTextClasses="border bg-light text-dark p-1 pr-3">
              <button className="btn btn-block text-nowrap p-2 border my-1" onClick={() => connectToLocalhost()}>
                <i className="fa-regular fa-desktop pr-2"></i>
                <FormattedMessage id="home.accessFileSystem" />
              </button>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeTabFile
