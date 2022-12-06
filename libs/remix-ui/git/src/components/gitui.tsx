import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { add, addall, checkout, checkoutfile, clone, commit, createBranch, remoteBranches, repositories, rm } from '../lib/gitactions'
import { loadFiles, setCallBacks } from '../lib/listeners'
import { setPlugin, statusChanged } from '../lib/pluginActions'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { gitReducer } from '../state/reducer'
import { defaultGitState, gitState } from '../types'
import { SourceControl } from './panels/sourcontrol'
import { Container, ProgressBar, Accordion, AccordionContext, Button, useAccordionToggle, Card } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { CommitMessage } from './panels/commitmessage'
import { Commits } from './panels/commits'
import { Branches } from './panels/branches'
import { SourceControlNavigation } from './navigation/sourcecontrol'
import { BranchesNavigation } from './navigation/branches'
import { CommitslNavigation } from './navigation/commits'
import '../style/index.css'
import { CloneNavigation } from './navigation/clone'
import { Clone } from './panels/clone'

export const gitPluginContext = React.createContext<gitState>(defaultGitState)

export const GitUI = (props) => {
    const plugin = props.plugin
    const [gitState, gitDispatch] = useReducer(gitReducer, defaultGitState)
    const [activePanel, setActivePanel] = useState<string>("0");
    const [highlightColor, setHighlightColor] = useState("text-white")

    useEffect(() => {
        setCallBacks(plugin, gitDispatch)
        setPlugin(plugin, gitDispatch)
        console.log(props)
    }, [])

    useEffect(() => {
        console.log(gitState.fileStatusResult)
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
        remoteBranches
    }

    const pluginActionsProviderValue = {
        statusChanged,
        loadFiles
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

                                <Accordion.Collapse eventKey="0">
                                    <>
                                        <CommitMessage />
                                        <SourceControl />
                                    </>
                                </Accordion.Collapse>
                                <hr></hr>

                                <CommitslNavigation eventKey="3" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse eventKey="3">
                                    <>
                                        <Commits />
                                    </>
                                </Accordion.Collapse>
                                <hr></hr>
                                <BranchesNavigation eventKey="2" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse eventKey="2">
                                    <>
                                        <Branches /></>
                                </Accordion.Collapse>
                                <hr></hr>
                                <CloneNavigation eventKey="4" activePanel={activePanel} callback={setActivePanel} />
                                <Accordion.Collapse eventKey="4">
                                    <>
                                        <Clone /></>
                                </Accordion.Collapse>
                                <hr></hr>

                            </Accordion>}
                    </pluginActionsContext.Provider>
                </gitActionsContext.Provider>
            </gitPluginContext.Provider>
        </div>
    )
}