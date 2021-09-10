import { MenuItems } from '@remix-ui/file-explorer'
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
