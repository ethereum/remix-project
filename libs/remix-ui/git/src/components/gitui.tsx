import React, { useEffect, useReducer, useState } from 'react'
import { add, addall, checkout, checkoutfile, clone, commit, createBranch, remoteBranches, repositories, rm, getCommitChanges, diff, resolveRef, getBranchCommits, setUpstreamRemote, getGitHubUser, getBranches, getRemotes } from '../lib/gitactions'
import { loadFiles, setCallBacks } from '../lib/listeners'
import { openDiff, openFile, saveToken, setPlugin, statusChanged } from '../lib/pluginActions'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { gitReducer } from '../state/reducer'
import { defaultGitState, gitState } from '../types'
import { SourceControl } from './panels/sourcontrol'
import { Accordion } from "react-bootstrap";
import { CommitMessage } from './panels/commitmessage'
import { Commits } from './panels/commits'
import { Branches } from './panels/branches'
import { SourceControlNavigation } from './navigation/sourcecontrol'
import { BranchesNavigation } from './navigation/branches'
import { CommitslNavigation } from './navigation/commits'
import '../style/index.css'
import { CloneNavigation } from './navigation/clone'
import { Clone } from './panels/clone'
import { Commands } from './panels/commands'
import { CommandsNavigation } from './navigation/commands'
import { RemotesNavigation } from './navigation/remotes'
import { Remotes } from './panels/remotes'
import { ViewPlugin } from '@remixproject/engine-web'
import { fileDecoration, fileDecorationType } from '@remix-ui/file-decorators'
import { removeSlash } from '../utils'
import { SettingsNavigation } from './navigation/settings'
import { Settings } from './panels/settings'
import { GitHubNavigation } from './navigation/github'
import { GitHubAuth } from './panels/github'
import { GitHubCredentials } from './panels/githubcredentials'

export const gitPluginContext = React.createContext<gitState>(defaultGitState)

interface IGitUi {
    plugin: ViewPlugin
}

export const GitUI = (props: IGitUi) => {
    const plugin = props.plugin
    const [gitState, gitDispatch] = useReducer(gitReducer, defaultGitState)
    const [activePanel, setActivePanel] = useState<string>("0");
    const [timeOut, setTimeOut] = useState<number>(null)

    useEffect(() => {
        setCallBacks(plugin, gitDispatch)
        setPlugin(plugin, gitDispatch)
        console.log(props)
    }, [])

    useEffect(() => {
        async function setDecorators() {
            console.log(gitState.fileStatusResult)
            const decorators: fileDecoration[] = []
            for (const file of gitState.modified) {
                const decorator: fileDecoration = {
                    path: removeSlash(file.filename),
                    isDirectory: false,
                    fileStateType: fileDecorationType.Custom,
                    fileStateLabelClass: 'text-warning',
                    fileStateIconClass: 'text-warning',
                    fileStateIcon: '',
                    text: 'M',
                    owner: 'git',
                    bubble: true,
                    comment: 'Modified'
                }
                decorators.push(decorator)
            }

            for (const file of gitState.untracked) {
                const decorator: fileDecoration = {
                    path: removeSlash(file.filename),
                    isDirectory: false,
                    fileStateType: fileDecorationType.Custom,
                    fileStateLabelClass: 'text-success',
                    fileStateIconClass: 'text-success',
                    fileStateIcon: '',
                    text: 'U',
                    owner: 'git',
                    bubble: true,
                    comment: 'Untracked'
                }
                decorators.push(decorator)
            }
            await plugin.call('fileDecorator', 'clearFileDecorators')
            await plugin.call('fileDecorator', 'setFileDecorators', decorators)
            setTimeOut(0)
        }

        setTimeout(() => {
            setDecorators(), timeOut
        })


    }, [gitState.fileStatusResult])


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
        getRemotes
    }

    const pluginActionsProviderValue = {
        statusChanged,
        loadFiles,
        openFile,
        openDiff,
        saveToken
    }

    return (
        <div className="m-1">
            <gitPluginContext.Provider value={gitState}>
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
                                <CommitslNavigation eventKey="3" activePanel={activePanel} callback={setActivePanel} />
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
                                <CloneNavigation eventKey="4" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse className='bg-light' eventKey="4">
                                    <>
                                        <Clone /></>
                                </Accordion.Collapse>
                                <hr></hr>
                                <RemotesNavigation eventKey="5" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse className='bg-light' eventKey="5">
                                    <>
                                        <Remotes></Remotes>
                                    </>
                                </Accordion.Collapse>
                                <hr></hr>
                                <SettingsNavigation eventKey="6" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse className='bg-light' eventKey="6">
                                    <>
                                        <Settings></Settings>
                                    </>
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
            </gitPluginContext.Provider>
        </div>
    )
}