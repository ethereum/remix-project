import { compiler_list } from 'circom_wasm'
import { Dispatch } from 'react'
import type { NoirPluginClient } from '../services/noirPluginClient'

export type CompilerStatus = "compiling" | "idle" | "errored" | "warning" | "succeed"
export interface INoirAppContext {
  appState: AppState
  dispatch: Dispatch<Actions>,
  plugin: NoirPluginClient
}

export interface AppState {
  filePath: string,
  filePathToId: Record<string, string>,
  autoCompile: boolean,
  hideWarnings: boolean,
  status: CompilerStatus,
  compilerFeedback: string
}

export interface ActionPayloadTypes {
  SET_AUTO_COMPILE: boolean,
  SET_HIDE_WARNINGS: boolean,
  SET_FILE_PATH: string,
  SET_COMPILER_FEEDBACK: string,
  SET_COMPILER_STATUS: CompilerStatus
}
export interface Action<T extends keyof ActionPayloadTypes> {
  type: T
  payload: ActionPayloadTypes[T]
}

export type Actions = {[A in keyof ActionPayloadTypes]: Action<A>}[keyof ActionPayloadTypes]
