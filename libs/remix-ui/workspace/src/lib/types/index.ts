import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
export interface WorkspaceProps {
  plugin: {
    setWorkspace: ({ name: string, isLocalhost: boolean }, setEvent: boolean) => void,
    createWorkspace: (name: string) => void,
    renameWorkspace: (oldName: string, newName: string) => void
    workspaceRenamed: ({ name: string }) => void,
    workspaceCreated: ({ name: string }) => void,
    workspaceDeleted: ({ name: string }) => void,
    workspace: any // workspace provider,
    browser: any // browser provider
    localhost: any // localhost provider
    fileManager : any
    registry: any // registry
    request: {
      createWorkspace: () => void,
      setWorkspace: (workspaceName: string) => void,
      createNewFile: () => void,
      uploadFile: (target: EventTarget & HTMLInputElement) => void,
      getCurrentWorkspace: () => void
    } // api request,
    workspaces: any,
    registeredMenuItems: MenuItems // menu items
    removedMenuItems: MenuItems
    initialWorkspace: string,
    resetNewFile: () => void,
    getWorkspaces: () => string[]
  }
}
export interface WorkspaceState {
  reset: boolean
  hideRemixdExplorer: boolean
  displayNewFile: boolean
  externalUploads: EventTarget & HTMLInputElement
  uploadFileEvent: EventTarget & HTMLInputElement
  loadingLocalhost: boolean
}

export interface Modal {
  hide?: boolean
  title: string
  message: string | JSX.Element
  okLabel: string
  okFn: () => void
  cancelLabel: string
  cancelFn: () => void
}

export interface File {
  path: string,
  name: string,
  isDirectory: boolean,
  type: 'folder' | 'file' | 'gist',
  child?: File[]
}

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

export interface FileExplorerMenuProps {
    title: string,
    menuItems: string[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    publishToGist: (path?: string) => void,
    uploadFile: (target: EventTarget & HTMLInputElement) => void
}

export type action = { name: string, type?: Array<'folder' | 'gist' | 'file'>, path?: string[], extension?: string[], pattern?: string[], id: string, multiselect: boolean, label: string }

export type MenuItems = action[]
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
