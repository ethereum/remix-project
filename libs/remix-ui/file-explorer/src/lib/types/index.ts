/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    registry: any,
    files: any,
    menuItems?: string[],
    plugin: any
}

export interface File {
    path: string,
    name: string,
    isDirectory: boolean,
    child?: File[]
}
