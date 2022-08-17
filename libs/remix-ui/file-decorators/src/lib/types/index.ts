export enum fileDecorationType {
    Error = 'ERROR',
    Warning = 'WARNING',
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
    owner?: string,
    workspace?: any
    tooltip?: string
    comment?: string[] | string
  }

  export interface FileType {
    path: string,
    name?: string,
    isDirectory?: boolean,
    type?: 'folder' | 'file' | 'gist',
    child?: File[]
  }