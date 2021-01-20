/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    registry: any,
    filesProvider: any,
    menuItems?: string[],
    plugin: any,
    focusRoot: boolean
}

export interface File {
    path: string,
    name: string,
    isDirectory: boolean,
    child?: File[]
}

export interface FileExplorerMenuProps {
    title: string,
    menuItems: string[],
    fileManager: any,
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    publishToGist: () => void,
    uploadFile: (target: EventTarget & HTMLInputElement) => void
}

export interface FileExplorerContextMenuProps {
    actions: { name: string, type: string[], path: string[], extension: string[], pattern: string[] }[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    deletePath: (path: string) => void,
    renamePath: (path: string, type: string) => void,
    hideContextMenu: () => void,
    extractParentFromKey?: (key: string) => string,
    publishToGist?: () => void,
    runScript?: (path: string) => void,
    pageX: number,
    pageY: number,
    path: string,
    type: string
}
