import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { add, addall, checkout, checkoutfile, commit, createBranch, rm } from '../lib/gitactions'
import { loadFiles, setCallBacks } from '../lib/listeners'
import { setPlugin, statusChanged } from '../lib/pluginActions'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { gitReducer } from '../state/reducer'
import { defaultGitState, gitState } from '../types'
import { SourceControl } from './sourcontrol'
import { Container, ProgressBar, Accordion, AccordionContext, Button, useAccordionToggle, Card } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { CommitMessage } from './commitmessage'
import { Commits } from './commits'
import { Branches } from './branches'

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
        createBranch
    }

    const pluginActionsProviderValue = {
        statusChanged,
        loadFiles
    }

    function CustomToggle(ob: any) {

        const currentEventKey = useContext(AccordionContext);
        const isCurrentEventKey = currentEventKey === ob.eventKey
        const decoratedOnClick = useAccordionToggle(
            ob.eventKey,
            () => {
                if (activePanel === ob.eventKey) {
                    //client.open('none')
                } else {
                    //client.open(panels[ob.eventKey])
                }

                ob.callback && ob.callback(ob.eventKey)
            },
        );


        return (
            <>
                <div onClick={decoratedOnClick} className='w-100 list-group-item p-0 pointer mb-1'>
                    <Accordion.Toggle eventKey={ob.eventKey}
                        as={Button}
                        variant="link"
                        className={`navbutton ${isCurrentEventKey ? highlightColor : ""}`}
                    >

                        {ob.children}

                    </Accordion.Toggle>
                    {
                        isCurrentEventKey ? <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretUp}></FontAwesomeIcon> : <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretDown}></FontAwesomeIcon>
                    }
                </div>
            </>
        );
    }


    return (
        <div className="m-1">
            <gitPluginContext.Provider value={gitState}>
                <gitActionsContext.Provider value={gitActionsProviderValue}>
                    <pluginActionsContext.Provider value={pluginActionsProviderValue}>
                        {gitState.loading && <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>}
                        {!gitState.loading &&
                            <Accordion defaultActiveKey="0">
                                <CustomToggle eventKey="0">SOURCE CONTROL</CustomToggle>

                                <Accordion.Collapse eventKey="0">
                                    <>
                                        <CommitMessage />
                                        <SourceControl />
                                    </>
                                </Accordion.Collapse>
                                <CustomToggle eventKey="3">COMMITS</CustomToggle>
                                <Accordion.Collapse eventKey="3">
                                    <>
                                        <Commits /><hr></hr>
                                    </>
                                </Accordion.Collapse>
                                <CustomToggle eventKey="2">BRANCHES</CustomToggle>
                                <Accordion.Collapse eventKey="2">
                                    <>
                                        <Branches /><hr></hr></>
                                </Accordion.Collapse>

                            </Accordion>}
                    </pluginActionsContext.Provider>
                </gitActionsContext.Provider>
            </gitPluginContext.Provider>
        </div>
    )
}