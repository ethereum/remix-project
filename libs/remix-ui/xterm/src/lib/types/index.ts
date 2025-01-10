
export interface xtermState {
  pid: number
  queue: string
  timeStamp: number
  ref: any
  hidden: boolean
}

export interface xTerminalUiState {
  terminalsEnabled: boolean
  terminals: xtermState[]
  shells: string[]
  showOutput: boolean
  workingDir: string
}

export interface ActionPayloadTypes {
  ENABLE_TERMINALS: undefined,
  DISABLE_TERMINALS: undefined,
  ADD_TERMINAL: xtermState,
  HIDE_TERMINAL: number,
  SHOW_TERMINAL: number,
  HIDE_ALL_TERMINALS: undefined,
  REMOVE_TERMINAL: number,
  ADD_SHELLS: string[],
  SHOW_OUTPUT: boolean
  SET_WORKING_DIR: string
}

export interface Action<T extends keyof ActionPayloadTypes> {
  type: T,
  payload: ActionPayloadTypes[T]
}

export type Actions = {[A in keyof ActionPayloadTypes]: Action<A>}[keyof ActionPayloadTypes]