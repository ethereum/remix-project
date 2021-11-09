
export interface ROOTS {
    steps: any,
    cmd: string,
    gidx: number,
    idx: number
}

export const KNOWN_TRANSACTION = 'knownTransaction'
export const UNKNOWN_TRANSACTION = 'unknownTransaction'
export const EMPTY_BLOCK = 'emptyBlock'
export const NEW_TRANSACTION = 'newTransaction'
export const NEW_BLOCK = 'newBlock'
export const NEW_CALL = 'newCall'

export const HTML = 'html'
export const LOG = 'log'
export const INFO = 'info'
export const WARN = 'warn'
export const ERROR = 'error'
export const SCRIPT = 'script'
export const CLEAR_CONSOLE = 'clearconsole'
export const LISTEN_ON_NETWORK = 'listenOnNetWork'
export const CMD_HISTORY = 'cmdHistory'

export interface RemixUiTerminalProps {
    plugin: any,
    onReady: (api: any) => void
}
