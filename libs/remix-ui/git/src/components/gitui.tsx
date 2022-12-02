import React, { useEffect, useReducer, useRef, useState } from 'react'
import { add, addall, checkoutfile, commit, rm } from '../lib/gitactions'
import { loadFiles, setCallBacks } from '../lib/listeners'
import { setPlugin, statusChanged } from '../lib/pluginActions'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { gitReducer } from '../state/reducer'
import { defaultGitState, gitState } from '../types'
import { SourceControl } from './sourcontrol'

export const gitPluginContext = React.createContext<gitState>(defaultGitState)

export const GitUI = (props) => {
    const plugin = props.plugin
    const [gitState, gitDispatch] = useReducer(gitReducer, defaultGitState)


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
        rm
    }

    const pluginActionsProviderValue = {
        statusChanged,
        loadFiles
    }

    return (
        <gitPluginContext.Provider value={gitState}>
            <gitActionsContext.Provider value={gitActionsProviderValue}>
                <pluginActionsContext.Provider value={pluginActionsProviderValue}>
                    <SourceControl />
                </pluginActionsContext.Provider>
            </gitActionsContext.Provider>
        </gitPluginContext.Provider>
    )
}