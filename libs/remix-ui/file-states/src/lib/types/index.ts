export enum fileStateType {
    Error = 'ERROR',
    Warning = 'WARNING',
    Success = 'SUCCESS',
    Loading = 'LOADING',
    Unsaved = 'UNSAVED',
    Untracked = 'UNTRACKED',
    Modified = 'MODIFIED',
    Staged = 'STAGED',
    Committed = 'COMMITTED',
    Deleted = 'DELETED',
    Added = 'ADDED',
    New = 'NEW',
    Compiled = 'COMPILED',
    Custom = 'CUSTOM',
  }
  
  export type fileState = {
    path: string,
    isDirectory: boolean,
    fileStateType: fileStateType,
    fileStateLabelClass: string,
    fileStateIconClass: string,
    fileStateIcon: string | HTMLDivElement | JSX.Element,
    bubble: boolean,
    comment: string,
    owner: string,
    workspace?: string
  }

  export interface FileType {
    path: string,
    name: string,
    isDirectory: boolean,
    type: 'folder' | 'file' | 'gist',
    child?: File[]
  }