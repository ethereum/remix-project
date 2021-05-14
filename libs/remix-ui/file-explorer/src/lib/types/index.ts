/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    registry: any,
    filesProvider: any,
    menuItems?: string[],
    plugin: any,
    focusRoot: boolean,
    contextMenuItems: { id: string, name: string, type: string[], path: string[], extension: string[], pattern: string[] }[],
    displayInput?: boolean,
    externalUploads?: EventTarget & HTMLInputElement
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
export type action = { name: string, type: string[], path: string[], extension: string[], pattern: string[], id: string }
export interface FileExplorerContextMenuProps {
    actions: action[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    deletePath: (path: string | string[]) => void,
    renamePath: (path: string, type: string) => void,
    hideContextMenu: () => void,
    publishToGist?: () => void,
    runScript?: (path: string) => void,
    emit?: (id: string, path: string | string[]) => void,
    pageX: number,
    pageY: number,
    path: string,
    type: string,
    focus: {key:string, type:string}[]
    onMouseOver?: (...args) => void
}
