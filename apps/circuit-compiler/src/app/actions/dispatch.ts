import {Dispatch} from 'react'
import {Action} from '../types'

export const dispatchCheckRemixd = (status: boolean) => (dispatch: Dispatch<Action<'SET_REMIXD_CONNECTION_STATUS'>>) => {
  dispatch({type: 'SET_REMIXD_CONNECTION_STATUS', payload: status})
}
