import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
export type MenuItems = action[] // eslint-disable-line no-use-before-define

/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    registry: any,
    filesProvider: any,
    menuItems?: string[],
    plugin: any,
    focusRoot: boolean,
    contextMenuItems: MenuItems,
    removedContextMenuItems: MenuItems,
    displayInput?: boolean,
    externalUploads?: EventTarget & HTMLInputElement,
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

export type action = { name: string, type: string[], path: string[], extension: string[], pattern: string[], id: string, multiselect: boolean, label: string }

export interface FileExplorerContextMenuProps {
    actions: action[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    deletePath: (path: string | string[]) => void,
    renamePath: (path: string, type: string) => void,
    hideContextMenu: () => void,
    publishToGist?: (path?: string, type?: string) => void,
    pushChangesToGist?: (path?: string, type?: string) => void,
    publishFolderToGist?: (path?: string, type?: string) => void,
    publishFileToGist?: (path?: string, type?: string) => void,
    runScript?: (path: string) => void,
    emit?: (cmd: customAction) => void,
    pageX: number,
    pageY: number,
    path: string,
    type: string,
    focus: {key:string, type:string}[],
    onMouseOver?: (...args) => void,
    copy?: (path: string, type: string) => void,
    paste?: (destination: string, type: string) => void
}
