export enum fileDecorationType {
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
    None = 'NONE'
  }
  
  export type fileDecoration = {
    path: string,
    isDirectory: boolean,
    fileStateType: fileDecorationType,
    fileStateLabelClass: string,
    fileStateIconClass: string,
    fileStateIcon: string | HTMLDivElement | JSX.Element,
    bubble: boolean,
    text?: string,
    owner: string,
    workspace?: any
    tooltip?: string
  }

  export interface FileType {
    path: string,
    name?: string,
    isDirectory?: boolean,
    type?: 'folder' | 'file' | 'gist',
    child?: File[]
  }