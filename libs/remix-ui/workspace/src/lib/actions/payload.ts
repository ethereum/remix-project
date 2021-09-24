export const setCurrentWorkspace = (workspace: string) => {
  return {
    type: 'SET_CURRENT_WORKSPACE',
    payload: workspace
  }
}

export const setWorkspaces = (workspaces: string[]) => {
  return {
    type: 'SET_WORKSPACES',
    payload: workspaces
  }
}

export const setMode = (mode: 'browser' | 'localhost') => {
  return {
    type: 'SET_MODE',
    payload: mode
  }
}

export const fetchDirectoryError = (error: any) => {
  return {
    type: 'FETCH_DIRECTORY_ERROR',
    payload: error
  }
}

export const fetchDirectoryRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_DIRECTORY_REQUEST',
    payload: promise
  }
}

export const fetchDirectorySuccess = (path: string, fileTree) => {
  return {
    type: 'FETCH_DIRECTORY_SUCCESS',
    payload: { path, fileTree }
  }
}

export const displayNotification = (title: string, message: string, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void) => {
  return {
    type: 'DISPLAY_NOTIFICATION',
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

export const hideNotification = () => {
  return {
    type: 'HIDE_NOTIFICATION'
  }
}

export const fileAddedSuccess = (filePath: string) => {
  return {
    type: 'FILE_ADDED_SUCCESS',
    payload: filePath
  }
}

export const folderAddedSuccess = (folderPath: string, fileTree) => {
  return {
    type: 'FOLDER_ADDED_SUCCESS',
    payload: { path: folderPath, fileTree }
  }
}

export const fileRemovedSuccess = (removePath: string) => {
  return {
    type: 'FILE_REMOVED_SUCCESS',
    payload: removePath
  }
}

export const fileRenamedSuccess = (path: string, oldPath: string, fileTree) => {
  return {
    type: 'FILE_RENAMED_SUCCESS',
    payload: { path, oldPath, fileTree }
  }
}

export const rootFolderChangedSuccess = (path: string) => {
  return {
    type: 'ROOT_FOLDER_CHANGED',
    payload: path
  }
}

export const addInputFieldSuccess = (path: string, fileTree, type: 'file' | 'folder' | 'gist') => {
  return {
    type: 'ADD_INPUT_FIELD',
    payload: { path, fileTree, type }
  }
}

export const removeInputFieldSuccess = (path: string, fileTree) => {
  return {
    type: 'REMOVE_INPUT_FIELD',
    payload: { path, fileTree }
  }
}

export const setReadOnlyMode = (mode: boolean) => {
  return {
    type: 'SET_READ_ONLY_MODE',
    payload: mode
  }
}

export const createWorkspaceError = (error: any) => {
  return {
    type: 'CREATE_WORKSPACE_ERROR',
    payload: error
  }
}

export const createWorkspaceRequest = (promise: Promise<any>) => {
  return {
    type: 'CREATE_WORKSPACE_REQUEST',
    payload: promise
  }
}

export const createWorkspaceSuccess = (workspaceName: string) => {
  return {
    type: 'CREATE_WORKSPACE_SUCCESS',
    payload: workspaceName
  }
}

export const fetchWorkspaceDirectoryError = (error: any) => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_ERROR',
    payload: error
  }
}

export const fetchWorkspaceDirectoryRequest = (promise: Promise<any>) => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_REQUEST',
    payload: promise
  }
}

export const fetchWorkspaceDirectorySuccess = (path: string, fileTree) => {
  return {
    type: 'FETCH_WORKSPACE_DIRECTORY_SUCCESS',
    payload: { path, fileTree }
  }
}

export const setRenameWorkspace = (oldName: string, workspaceName: string) => {
  return {
    type: 'RENAME_WORKSPACE',
    payload: { oldName, workspaceName }
  }
}

export const setDeleteWorkspace = (workspaceName: string) => {
  return {
    type: 'DELETE_WORKSPACE',
    payload: workspaceName
  }
}

export const displayPopUp = (message: string) => {
  return {
    type: 'DISPLAY_POPUP_MESSAGE',
    payload: message
  }
}

export const hidePopUp = () => {
  return {
    type: 'HIDE_POPUP_MESSAGE'
  }
}

export const focusElement = (elements: { key: string, type: 'file' | 'folder' | 'gist' }[]) => {
  return {
    type: 'SET_FOCUS_ELEMENT',
    payload: elements
  }
}
