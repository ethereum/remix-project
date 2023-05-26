import { Dispatch } from 'react'
import { CircomPluginClient } from '../services/circomPluginClient'

const plugin = new CircomPluginClient()

export const initCircomPluginActions = () => async (dispatch: Dispatch<any>) => {
    plugin.internalEvents.on('connectionChanged', (connected: boolean) => {
        dispatch({ type: 'SET_REMIXD_CONNECTION_STATUS', payload: connected })
    })
}

export function activateRemixd () {
    plugin.activateRemixDeamon()
}