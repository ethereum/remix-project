import React, { useEffect, useReducer, useState } from 'react'
import { add, addall, checkout, checkoutfile, clone, commit, createBranch, remoteBranches, repositories, rm, getCommitChanges, diff, resolveRef, getBranchCommits, setUpstreamRemote, getGitHubUser, getBranches, getRemotes, remoteCommits, saveGitHubCredentials, getGitHubCredentials, fetch, pull, push, setDefaultRemote } from '../lib/gitactions'
import { loadFiles, setCallBacks } from '../lib/listeners'
import { openDiff, openFile, saveToken, setModifiedDecorator, setPlugin, setUntrackedDecorator, statusChanged } from '../lib/pluginActions'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { gitReducer } from '../state/gitreducer'
import { defaultGitState, defaultLoaderState, gitState, loaderState } from '../types'
import { SourceControl } from './panels/sourcontrol'
import { Accordion } from "react-bootstrap";
import { CommitMessage } from './panels/commitmessage'
import { Commits } from './panels/commits'
import { Branches } from './panels/branches'
import { SourceControlNavigation } from './navigation/sourcecontrol'
import { BranchesNavigation } from './navigation/branches'
import { CommitsNavigation } from './navigation/commits'
import '../style/index.css'
import { CloneNavigation } from './navigation/clone'
import { Clone } from './panels/clone'
import { Commands } from './panels/commands'
import { CommandsNavigation } from './navigation/commands'
import { RemotesNavigation } from './navigation/remotes'
import { Remotes } from './panels/remotes'
import { ViewPlugin } from '@remixproject/engine-web'
import { SettingsNavigation } from './navigation/settings'
import { Settings } from './panels/settings'
import { GitHubNavigation } from './navigation/github'
import { GitHubAuth } from './panels/github'
import { GitHubCredentials } from './panels/githubcredentials'
import { loaderReducer } from '../state/loaderReducer'
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import { client, getApolloLink } from '../state/apolloClient'

export const gitPluginContext = React.createContext<gitState>(defaultGitState)
export const loaderContext = React.createContext<loaderState>(defaultLoaderState)

interface IGitUi {
  plugin: ViewPlugin
}

export const GitUI = (props: IGitUi) => {
  const plugin = props.plugin
  const [gitState, gitDispatch] = useReducer(gitReducer, defaultGitState)
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>(client)
  const [loaderState, loaderDispatch] = useReducer(loaderReducer, defaultLoaderState)
  const [activePanel, setActivePanel] = useState<string>("0");
  const [timeOut, setTimeOut] = useState<number>(null)

  useEffect(() => {
    setCallBacks(plugin, gitDispatch, loaderDispatch)
    setPlugin(plugin, gitDispatch, loaderDispatch)
    loaderDispatch({ type: 'plugin', payload: true })
    console.log(props)
  }, [])

  useEffect(() => {


    async function setDecorators(gitState: gitState) {
      await plugin.call('fileDecorator', 'clearFileDecorators')
      await setModifiedDecorator(gitState.modified)
      await setUntrackedDecorator(gitState.untracked)
    }

    console.log('gitState.fileStatusResult', gitState.fileStatusResult)

    setTimeout(() => {
      setDecorators(gitState)
    })


  }, [gitState.fileStatusResult])

  useEffect(() => {


    async function updatestate() {
      console.log('updatestate', gitState)
      if (gitState.currentBranch && gitState.currentBranch.remote && gitState.currentBranch.remote.url) {
        remoteCommits(gitState.currentBranch.remote.url, gitState.currentBranch.name, 1)
      }
      if(gitState.gitHubAccessToken) {
        client.setLink(getApolloLink(gitState.gitHubAccessToken))
      }
    }
    setTimeout(() => {
      updatestate()
    })

  }, [gitState.gitHubUser, gitState.currentBranch, gitState.remotes, gitState.gitHubAccessToken])


  const gitActionsProviderValue = {
    commit,
    addall,
    add,
    checkoutfile,
    rm,
    checkout,
    createBranch,
    clone,
    repositories,
    remoteBranches,
    getCommitChanges,
    getBranchCommits,
    diff,
    resolveRef,
    setUpstreamRemote,
    getGitHubUser,
    getBranches,
    getRemotes,
    fetch,
    pull,
    push,
    setDefaultRemote
  }

  const pluginActionsProviderValue = {
    statusChanged,
    loadFiles,
    openFile,
    openDiff,
    saveToken,
    saveGitHubCredentials,
    getGitHubCredentials
  }

  return (
    <div className="m-1">
      <ApolloProvider client={apolloClient}>
        <gitPluginContext.Provider value={gitState}>
          <loaderContext.Provider value={loaderState}>
            <gitActionsContext.Provider value={gitActionsProviderValue}>
              <pluginActionsContext.Provider value={pluginActionsProviderValue}>
                {gitState.loading && <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>}
                {!gitState.loading &&
                  <Accordion activeKey={activePanel} defaultActiveKey="0">
                    <SourceControlNavigation eventKey="0" activePanel={activePanel} callback={setActivePanel} />

                    <Accordion.Collapse className='bg-light' eventKey="0">
                      <>
                        <CommitMessage />
                        <SourceControl />
                      </>
                    </Accordion.Collapse>
                    <hr></hr>
                    <CommandsNavigation eventKey="1" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="1">
                      <>
                        <Commands></Commands>
                      </>
                    </Accordion.Collapse>
                    <hr></hr>
                    <CommitsNavigation title={`COMMITS`} eventKey="3" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="3">
                      <>
                        <Commits />
                      </>
                    </Accordion.Collapse>
                    <hr></hr>
                    <BranchesNavigation eventKey="2" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="2">
                      <>
                        <Branches /></>
                    </Accordion.Collapse>
                    <hr></hr>
                    <RemotesNavigation eventKey="5" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="5">
                      <>
                        <Remotes></Remotes>
                      </>
                    </Accordion.Collapse>
                    <hr></hr>
                    <CloneNavigation eventKey="4" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="4">
                      <>
                        <Clone /></>
                    </Accordion.Collapse>
                    <hr></hr>
                    <GitHubNavigation eventKey="7" activePanel={activePanel} callback={setActivePanel} />
                    <Accordion.Collapse className='bg-light' eventKey="7">
                      <>
                        <GitHubAuth></GitHubAuth>
                        <GitHubCredentials></GitHubCredentials>
                      </>
                    </Accordion.Collapse>



                  </Accordion>}
              </pluginActionsContext.Provider>
            </gitActionsContext.Provider>
          </loaderContext.Provider>
        </gitPluginContext.Provider>
      </ApolloProvider>
    </div>
  )
}