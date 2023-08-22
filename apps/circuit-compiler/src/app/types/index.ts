import {Dispatch} from 'react'

export interface IAppContext {
  appState: AppState
  dispatch: Dispatch<any>
}

export interface ActionPayloadTypes {
  SET_REMIXD_CONNECTION_STATUS: boolean
}

export interface Action<T extends keyof ActionPayloadTypes> {
  type: T
  payload: ActionPayloadTypes[T]
}

export type Actions = {[A in keyof ActionPayloadTypes]: Action<A>}[keyof ActionPayloadTypes]

export interface AppState {
  isRemixdConnected: boolean
}
