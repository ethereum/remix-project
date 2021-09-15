import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
export type MenuItems = action[] // eslint-disable-line no-use-before-define

/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    menuItems?: string[],
    focusRoot: boolean,
    contextMenuItems: MenuItems,
    removedContextMenuItems: MenuItems,
    displayInput?: boolean,
    externalUploads?: EventTarget & HTMLInputElement,
    resetFocus?: (value: boolean) => void,
    files: { [x: string]: Record<string, File> }
}

export interface File {
    path: string,
    name: string,
    isDirectory: boolean,
    type: 'folder' | 'file' | 'gist',
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

export type action = { name: string, type?: Array<'folder' | 'gist' | 'file'>, path?: string[], extension?: string[], pattern?: string[], id: string, multiselect: boolean, label: string }

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

export interface FileExplorerState {
    focusElement: {
      key: string
      type: 'folder' | 'file' | 'gist'
    }[]
    ctrlKey: boolean
    newFileName: string
    actions: {
      id: string
      name: string
      type?: Array<'folder' | 'gist' | 'file'>
      path?: string[]
      extension?: string[]
      pattern?: string[]
      multiselect: boolean
      label: string
    }[]
    focusContext: {
      element: string
      x: number
      y: number
      type: string
    }
    focusEdit: {
      element: string
      type: string
      isNew: boolean
      lastEdit: string
    }
    expandPath: string[]
    mouseOverElement: string
    showContextMenu: boolean
    reservedKeywords: string[]
    copyElement: {
      key: string
      type: 'folder' | 'gist' | 'file'
    }[]
  }
