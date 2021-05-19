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
    type: string,
    child?: File[]
}

export interface FileExplorerMenuProps {
    title: string,
    menuItems: string[],
    fileManager: any,
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    publishToGist: (path?: string) => void,
    uploadFile: (target: EventTarget & HTMLInputElement) => void
}

export interface FileExplorerContextMenuProps {
    actions: { name: string, type: string[], path: string[], extension: string[], pattern: string[], id: string }[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    deletePath: (path: string) => void,
    renamePath: (path: string, type: string) => void,
    hideContextMenu: () => void,
    publishToGist?: (path?: string, type?: string) => void,
    pushChangesToGist?: (path?: string, type?: string) => void,
    publishFolderToGist?: (path?: string, type?: string) => void,
    publishFileToGist?: (path?: string, type?: string) => void,
    runScript?: (path: string) => void,
    emit?: (id: string, path: string) => void,
    pageX: number,
    pageY: number,
    path: string,
    type: string,
    onMouseOver?: (...args) => void,
    copy?: (path: string, type: string) => void
    paste?: (destination: string) => void
}
