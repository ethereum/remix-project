import { compiler_list } from 'circom_wasm'
import {Dispatch} from 'react'
import { CircomPluginClient } from '../services/circomPluginClient'

export type CompilerStatus = "compiling" | "generating" | "computing" | "idle" | "errored"
export interface ICircuitAppContext {
  appState: AppState
  dispatch: Dispatch<Actions>,
  plugin: CircomPluginClient
}

export interface ActionPayloadTypes {
  SET_COMPILER_VERSION: string,
  SET_FILE_PATH: string,
  SET_COMPILER_STATUS: CompilerStatus,
  SET_PRIME_VALUE: PrimeValue,
  SET_AUTO_COMPILE: boolean,
  SET_SIGNAL_INPUTS: string[]
}
export interface Action<T extends keyof ActionPayloadTypes> {
  type: T
  payload: ActionPayloadTypes[T]
}

export type Actions = {[A in keyof ActionPayloadTypes]: Action<A>}[keyof ActionPayloadTypes]

export interface AppState {
  version: string,
  versionList: typeof compiler_list.wasm_builds,
  filePath: string,
  status: CompilerStatus,
  primeValue: PrimeValue,
  autoCompile: boolean,
  signalInputs: string[]
}

export type CompilationConfig = {
  prime: PrimeValue,
  version: string
}

export type PrimeValue = "bn128" | "bls12381" | "goldilocks"