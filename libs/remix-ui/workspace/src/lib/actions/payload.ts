import { fileDecoration } from '@remix-ui/file-decorators'
import { branch } from '@remix-ui/git';
import { Action, ActionPayloadTypes, FileTree, WorkspaceElement, action } from '../types'

export const setCurrentWorkspace = (workspace: { name: string; isGitRepo: boolean; }): Action<'SET_CURRENT_WORKSPACE'> => {
  return {
    type: 'SET_CURRENT_WORKSPACE',
    payload: workspace
  }
}

export const setWorkspaces = (workspaces: { name: string; isGitRepo: boolean; }[]): Action<'SET_WORKSPACES'> => {
  return {
    type: 'SET_WORKSPACES',
    payload: workspaces
  }
}

export const setMode = (mode: 'browser' | 'localhost'): Action<'SET_MODE'> => {
  return {
    type: 'SET_MODE',
    payload: mode
  }
}

export const fetchDirectoryError = (error: string): Action<'FETCH_DIRECTORY_ERROR'> => {
  return {
    type: 'FETCH_DIRECTORY_ERROR',
    payload: error
  }
}

export const fetchDirectoryRequest = (): Action<'FETCH_DIRECTORY_REQUEST'> => {
  return {
    type: 'FETCH_DIRECTORY_REQUEST',
    payload: undefined
  }
}

export const fetchDirectorySuccess = (path: string, fileTree: FileTree): Action<'FETCH_DIRECTORY_SUCCESS'> => {
  return {
    type: 'FETCH_DIRECTORY_SUCCESS',
    payload: { path, fileTree }
  }
}

export const displayNotification = (title: string, message: string, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void): Action<'DISPLAY_NOTIFICATION'> => {
  return {
    type: 'DISPLAY_NOTIFICATION',
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

export const hideNotification = (): Action<'HIDE_NOTIFICATION'> => {
  return {
    type: 'HIDE_NOTIFICATION',
    payload: null
  }
}

export const fileAddedSuccess = (filePath: string): Action<'FILE_ADDED_SUCCESS'> => {
  return {
    type: 'FILE_ADDED_SUCCESS',
    payload: filePath
  }
}

export const folderAddedSuccess = (path: string, folderPath: string, fileTree: FileTree): Action<'FOLDER_ADDED_SUCCESS'> => {
  return {
    type: 'FOLDER_ADDED_SUCCESS',
    payload: { path, folderPath, fileTree }
  }
}

export const fileRemovedSuccess = (removePath: string): Action<'FILE_REMOVED_SUCCESS'> => {
  return {
    type: 'FILE_REMOVED_SUCCESS',
    payload: removePath
  }
}

export const fileRenamedSuccess = (path: string, oldPath: string, fileTree: FileTree): Action<'FILE_RENAMED_SUCCESS'> => {
  return {
    type: 'FILE_RENAMED_SUCCESS',
    payload: { path, oldPath, fileTree }
  }
}

export const rootFolderChangedSuccess = (path: string): Action<'ROOT_FOLDER_CHANGED'> => {
  return {
    type: 'ROOT_FOLDER_CHANGED',
    payload: path
  }
}

export const addInputFieldSuccess = (path: string, fileTree: FileTree, type: 'file' | 'folder'): Action<'ADD_INPUT_FIELD'> => {
  return {
    type: 'ADD_INPUT_FIELD',
    payload: { path, fileTree, type }
  }
}

export const removeInputFieldSuccess = (path: string): Action<'REMOVE_INPUT_FIELD'> => {
  return {
    type: 'REMOVE_INPUT_FIELD',
    payload: { path }
  }
}

export const setReadOnlyMode = (mode: boolean): Action<'SET_READ_ONLY_MODE'> => {
  return {
    type: 'SET_READ_ONLY_MODE',
    payload: mode
  }
}

export const createWorkspaceError = (error: string): Action<'CREATE_WORKSPACE_ERROR'> => {
  return {
    type: 'CREATE_WORKSPACE_ERROR',
    payload: error
  }
}

export const createWorkspaceRequest = (): Action<'CREATE_WORKSPACE_REQUEST'> => {
  return {
    type: 'CREATE_WORKSPACE_REQUEST',
    payload: null
  }
}

export const createWorkspaceSuccess = (workspaceName: ActionPayloadTypes['CREATE_WORKSPACE_SUCCESS']): Action<'CREATE_WORKSPACE_SUCCESS'> => {
  return {
    type: 'CREATE_WORKSPACE_SUCCESS',
    payload: workspaceName
  }
}

export const fetchWorkspaceDirectoryError = (error: string): Action<'FETCH_WORKSPACE_DIRECTORY_ERROR'> => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_ERROR',
    payload: error
  }
}

export const fetchWorkspaceDirectoryRequest = (): Action<'FETCH_WORKSPACE_DIRECTORY_REQUEST'> => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_REQUEST',
    payload: null
  }
}

export const fetchWorkspaceDirectorySuccess = (path: string, fileTree: FileTree): Action<'FETCH_WORKSPACE_DIRECTORY_SUCCESS'> => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_SUCCESS',
    payload: { path, fileTree }
  }
}

export const setRenameWorkspace = (oldName: string, workspaceName: string): Action<'RENAME_WORKSPACE'> => {
  return {
    type: 'RENAME_WORKSPACE',
    payload: { oldName, workspaceName }
  }
}

export const setDeleteWorkspace = (workspaceName: string): Action<'DELETE_WORKSPACE'> => {
  return {
    type: 'DELETE_WORKSPACE',
    payload: workspaceName
  }
}

export const displayPopUp = (message: string): Action<'DISPLAY_POPUP_MESSAGE'> => {
  return {
    type: 'DISPLAY_POPUP_MESSAGE',
    payload: message
  }
}

export const hidePopUp = (): Action<'HIDE_POPUP_MESSAGE'> => {
  return {
    type: 'HIDE_POPUP_MESSAGE',
    payload: null
  }
}

export const focusElement = (elements: { key: string, type: WorkspaceElement }[]): Action<'SET_FOCUS_ELEMENT'> => {
  return {
    type: 'SET_FOCUS_ELEMENT',
    payload: elements
  }
}

export const removeFocus = (name: string): Action<'REMOVE_FOCUS_ELEMENT'> => {
  return {
    type: 'REMOVE_FOCUS_ELEMENT',
    payload: name
  }
}

export const setContextMenuItem = (item: action): Action<'SET_CONTEXT_MENU_ITEM'> => {
  return {
    type: 'SET_CONTEXT_MENU_ITEM',
    payload: item
  }
}

export const removeContextMenuItem = (plugin: { name: string }): Action<'REMOVE_CONTEXT_MENU_ITEM'> => {
  return {
    type: 'REMOVE_CONTEXT_MENU_ITEM',
    payload: plugin
  }
}

export const setExpandPath = (paths: string[]): Action<'SET_EXPAND_PATH'> => {
  return {
    type: 'SET_EXPAND_PATH',
    payload: paths
  }
}

export const loadLocalhostError = (error: string): Action<'LOAD_LOCALHOST_ERROR'> => {
  return {
    type: 'LOAD_LOCALHOST_ERROR',
    payload: error
  }
}

export const loadLocalhostRequest = (): Action<'LOAD_LOCALHOST_REQUEST'> => {
  return {
    type: 'LOAD_LOCALHOST_REQUEST',
    payload: null
  }
}

export const loadLocalhostSuccess = (): Action<'LOAD_LOCALHOST_SUCCESS'> => {
  return {
    type: 'LOAD_LOCALHOST_SUCCESS',
    payload: null
  }
}

export const fsInitializationCompleted = (): Action<'FS_INITIALIZATION_COMPLETED'> => {
  return {
    type: 'FS_INITIALIZATION_COMPLETED',
    payload: null
  }
}

export const setFileDecorationSuccess = (items: fileDecoration[]): Action<'SET_FILE_DECORATION_SUCCESS'> => {
  return {
    type: 'SET_FILE_DECORATION_SUCCESS',
    payload: items
  }
}
export const cloneRepositoryRequest = (): Action<'CLONE_REPOSITORY_REQUEST'> => {
  return {
    type: 'CLONE_REPOSITORY_REQUEST',
    payload: null
  }
}

export const cloneRepositorySuccess = (): Action<'CLONE_REPOSITORY_SUCCESS'> => {
  return {
    type: 'CLONE_REPOSITORY_SUCCESS',
    payload: null
  }
}

export const cloneRepositoryFailed = (): Action<'CLONE_REPOSITORY_FAILED'> => {
  return {
    type: 'CLONE_REPOSITORY_FAILED',
    payload: null
  }
}

export const setCurrentWorkspaceBranches = (branches?: { remote: any, name: string }[]): Action<'SET_CURRENT_WORKSPACE_BRANCHES'> => {
  return {
    type: 'SET_CURRENT_WORKSPACE_BRANCHES',
    payload: branches
  }
}

export const setCurrentWorkspaceCurrentBranch = (currentBranch?: branch): Action<'SET_CURRENT_WORKSPACE_CURRENT_BRANCH'> => {
  return {
    type: 'SET_CURRENT_WORKSPACE_CURRENT_BRANCH',
    payload: currentBranch
  }
}

export const setCurrentWorkspaceIsGitRepo = (isRepo: boolean): Action<'SET_CURRENT_WORKSPACE_IS_GITREPO'> => {
  return {
    type: 'SET_CURRENT_WORKSPACE_IS_GITREPO',
    payload: isRepo
  }
}

export const setCurrentWorkspaceHasGitSubmodules = (hasGitSubmodules: boolean): Action<'SET_CURRENT_WORKSPACE_HAS_GIT_SUBMODULES'> => {
  return {
    type: 'SET_CURRENT_WORKSPACE_HAS_GIT_SUBMODULES',
    payload: hasGitSubmodules
  }
}

export const setGitConfig = (config: {username: string, token: string, email: string}): Action<'SET_GIT_CONFIG'> => {
  return {
    type: 'SET_GIT_CONFIG',
    payload: config
  }
}

export const setElectronRecentFolders = (folders: string[]): Action<'SET_ELECTRON_RECENT_FOLDERS'> => {
  return {
    type: 'SET_ELECTRON_RECENT_FOLDERS',
    payload: folders
  }
}

export const setCurrentLocalFilePath = (path: string): Action<'SET_CURRENT_LOCAL_FILE_PATH'> => {
  return {
    type: 'SET_CURRENT_LOCAL_FILE_PATH',
    payload: path
  }
}
