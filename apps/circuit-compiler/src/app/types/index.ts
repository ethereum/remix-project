import { compiler_list } from 'circom_wasm'
import {Dispatch} from 'react'
import { CircomPluginClient } from '../services/circomPluginClient'

export type CompilerStatus = "compiling" | "generating" | "computing" | "idle" | "errored" | "warning"
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
  SET_HIDE_WARNINGS: boolean,
  SET_SIGNAL_INPUTS: string[],
  SET_COMPILER_FEEDBACK: string | CompilerReport[]
  SET_FILE_PATH_TO_ID: Record<number, string>
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
  filePathToId: Record<string, string>,
  status: CompilerStatus,
  primeValue: PrimeValue,
  autoCompile: boolean,
  hideWarnings: boolean,
  signalInputs: string[],
  feedback: string | CompilerReport[]
}

export type CompilationConfig = {
  prime: PrimeValue,
  version: string
}

export type PrimeValue = "bn128" | "bls12381" | "goldilocks"

export type CompilerFeedbackProps = {
  feedback: string | CompilerReport[],
  filePathToId: Record<string, string>,
  openErrorLocation: (location: string, startRange: string) => void,
  hideWarnings: boolean
}

export type CompilerReport = {
  type: "Error" | "Bug" | "Help" | "Note" | "Warning" | "Unknown",
  message: string,
  labels: {
    style: "Primary" | "Secondary" | "Unknown",
    file_id: string,
    range: {
      start: string,
      end: string
    },
    message: string
  }[],
  notes: string[]
}

export type FeedbackAlertProps = {
  message: string,
  location: string
}

export type ConfigurationsProps = {
  setPrimeValue: (prime: PrimeValue) => void,
  primeValue: PrimeValue
}

export type CompileOptionsProps = {
  setCircuitAutoCompile: (value: boolean) => void,
  setCircuitHideWarnings: (value: boolean) => void,
  autoCompile: boolean,
  hideWarnings: boolean
}

export type ResolverOutput = {
  [name: string]: {
    content: string,
    parent: string
  }
}