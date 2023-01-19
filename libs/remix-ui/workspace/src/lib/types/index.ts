import React from 'react'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { fileDecoration } from '@remix-ui/file-decorators';
import { IRemixApi } from '@remixproject/plugin-api';
import { MethodParams } from '@remixproject/plugin-utils';

export type action = { name: string, type?: Array<'folder' | 'gist' | 'file'>, path?: string[], extension?: string[], pattern?: string[], id: string, multiselect: boolean, label: string, sticky?: boolean }
export interface JSONStandardInput {
  language: "Solidity";
  settings?: any,
  sources: {
    [globalName: string]: {
      keccak256?: string;
      content: string;
    },
  };
}
export type MenuItems = action[]
export type WorkspaceTemplate = 'gist-template' | 'code-template' | 'remixDefault' | 'blank' | 'ozerc20' | 'zeroxErc20' | 'ozerc721'
export interface WorkspaceProps {
  plugin: FilePanelType
}
export interface WorkspaceState {
  hideRemixdExplorer: boolean
  displayNewFile: boolean
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

export interface FileType {
  path: string,
  name: string,
  isDirectory: boolean,
  type: 'folder' | 'file' | 'gist',
  child?: File[]
}

export type FilePanelType = {
    setWorkspace: ({ name, isLocalhost }, setEvent: boolean) => void,
    createWorkspace: (name: string, workspaceTemplateName: string) => void,
    renameWorkspace: (oldName: string, newName: string) => void
    compileContractForUml: (path: string) => void
    workspaceRenamed: ({ name }) => void,
    workspaceCreated: ({ name }) => void,
    workspaceDeleted: ({ name }) => void,
    workspace?: any // workspace provider,
    browser?: any // browser provider
    localhost?: any // localhost provider
    fileManager? : any
    registry?: any // registry
    pluginApi?: any
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

/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    menuItems?: string[],
    plugin: any
    contextMenuItems: MenuItems,
    removedContextMenuItems: MenuItems,
    files: { [x: string]: Record<string, FileType> },
    fileState: fileDecoration[],
    expandPath: string[],
    focusEdit: string,
    hideIconsMenu: React.Dispatch<React.SetStateAction<boolean>>,
    showIconsMenu: boolean,
    focusElement: { key: string, type: 'file' | 'folder' | 'gist' }[],
    dispatchCreateNewFile: (path: string, rootDir: string) => Promise<void>,
    // eslint-disable-next-line no-undef
    modal:(title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
    dispatchCreateNewFolder: (path: string, rootDir: string) => Promise<void>,
    readonly: boolean,
    toast: (toasterMsg: string) => void,
    dispatchDeletePath: (path: string[]) => Promise<void>,
    dispatchRenamePath: (oldPath: string, newPath: string) => Promise<void>,
    dispatchUploadFile: (target?: React.SyntheticEvent, targetFolder?: string) => Promise<void>,
    dispatchCopyFile: (src: string, dest: string) => Promise<void>,
    dispatchCopyFolder: (src: string, dest: string) => Promise<void>,
    dispatchRunScript: (path: string) => Promise<void>,
    dispatchPublishToGist: (path?: string, type?: string) => Promise<void>,
    dispatchEmitContextMenuEvent: (cmd: customAction) => Promise<void>,
    dispatchHandleClickFile: (path: string, type: 'file' | 'folder' | 'gist') => Promise<void>,
    dispatchSetFocusElement: (elements: { key: string, type: 'file' | 'folder' | 'gist' }[]) => Promise<void>,
    dispatchFetchDirectory:(path: string) => Promise<void>,
    dispatchRemoveInputField:(path: string) => Promise<void>,
    dispatchAddInputField:(path: string, type: 'file' | 'folder') => Promise<void>,
    dispatchHandleExpandPath: (paths: string[]) => Promise<void>,
    dispatchMoveFile: (src: string, dest: string) => Promise<void>,
    dispatchMoveFolder: (src: string, dest: string) => Promise<void>
}
type Placement = import('react-overlays/usePopper').Placement
export interface FileExplorerMenuProps {
    title: string,
    menuItems: string[],
    createNewFile: (folder?: string) => void,
    createNewFolder: (parentFolder?: string) => void,
    publishToGist: (path?: string) => void,
    uploadFile: (target: EventTarget & HTMLInputElement) => void
    tooltipPlacement?: Placement
}
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
    copyFileName?: (path: string, type: string) => void
    copyPath?: (path: string, type: string) => void
    generateUml?: (path: string) => void
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
    mouseOverElement: string
    showContextMenu: boolean
    reservedKeywords: string[]
    copyElement: {
      key: string
      type: 'folder' | 'gist' | 'file'
    }[]
  }
