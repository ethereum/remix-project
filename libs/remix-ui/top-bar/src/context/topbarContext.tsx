import { createContext, SyntheticEvent } from 'react'

export const FileSystemContext = createContext<{
  fs: any,
  plugin: any,
  modal:(title: string | JSX.Element, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  dispatchInitWorkspace:() => Promise<void>,
  dispatchFetchDirectory:(path: string) => Promise<void>,
  dispatchCreateWorkspace: (workspaceName: string, workspaceTemplateName: string, opts?, initGitRepo?: boolean) => Promise<void>,
  dispatchFetchWorkspaceDirectory: (path: string) => Promise<void>,
  dispatchSwitchToWorkspace: (name: string) => Promise<void>,
  dispatchRenameWorkspace: (oldName: string, workspaceName: string) => Promise<void>,
  dispatchDeleteWorkspace: (workspaceName: string) => Promise<void>,
  dispatchDeleteAllWorkspaces: () => Promise<void>,
  dispatchPublishToGist: (path?: string, type?: string) => Promise<void>,
  dispatchPublishFilesToGist: (selectedFiles: { key: string, type: 'file' | 'folder', content: string }[]) => void,
  dispatchUploadFile: (target?: SyntheticEvent, targetFolder?: string) => Promise<void>,
  dispatchUploadFolder: (target?: SyntheticEvent, targetFolder?: string) => Promise<void>,
  dispatchCreateNewFile: (path: string, rootDir: string) => Promise<void>,
  dispatchSetFocusElement: (elements: { key: string, type: 'file' | 'folder' }[]) => Promise<void>,
  dispatchCreateNewFolder: (path: string, rootDir: string) => Promise<void>,
  dispatchDeletePath: (path: string[]) => Promise<void>,
  dispatchRenamePath: (oldPath: string, newPath: string) => Promise<void>,
  dispatchDownloadPath: (path:string) => Promise<void>,
  dispatchHandleDownloadFiles: () => Promise<void>,
  dispatchHandleDownloadWorkspace: () => Promise<void>,
  dispatchHandleRestoreBackup: () => Promise<void>
  dispatchCloneRepository: (url: string) => Promise<void>
    }>(null)

