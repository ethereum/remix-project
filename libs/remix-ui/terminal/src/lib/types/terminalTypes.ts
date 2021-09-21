
export interface ROOTS {
    steps: any,
    cmd: string,
    gidx: number,
    idx: number
}

export const KnownTransaction = 'knownTransaction'
export const UnknownTransaction = 'unknownTransaction'
export const EmptyBlock = 'emptyBlock'
export const NewTransaction = 'newTransaction'
export const NewBlock = 'newBlock'
export const NewCall = 'newCall'

export interface RemixUiTerminalProps {
    plugin: any
}
