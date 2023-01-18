import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel/type'
import { createContext, SyntheticEvent } from 'react'
import { BrowserState } from '../reducers/workspace'
import { FilePanelType } from '../types'


export const FileSystemContext = createContext<{
  fs: BrowserState,
  modal:(title: string | JSX.Element, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  plugin: FilePanelType
  dispatchInitWorkspace:() => Promise<void>,
  dispatchFetchDirectory:(path: string) => Promise<void>,
  dispatchAddInputField:(path: string, type: 'file' | 'folder') => Promise<void>,
  dispatchRemoveInputField:(path: string) => Promise<void>,
  dispatchCreateWorkspace: (workspaceName: string, workspaceTemplateName: string, opts?, initGitRepo?: boolean) => Promise<void>,
  toast: (toasterMsg: string) => void,
  dispatchFetchWorkspaceDirectory: (path: string) => Promise<void>,
  dispatchSwitchToWorkspace: (name: string) => Promise<void>,
  dispatchRenameWorkspace: (oldName: string, workspaceName: string) => Promise<void>,
  dispatchDeleteWorkspace: (workspaceName: string) => Promise<void>,
  dispatchPublishToGist: (path?: string, type?: string) => Promise<void>,
  dispatchUploadFile: (target?: SyntheticEvent, targetFolder?: string) => Promise<void>,
  dispatchCreateNewFile: (path: string, rootDir: string) => Promise<void>,
  dispatchSetFocusElement: (elements: { key: string, type: 'file' | 'folder' | 'gist' }[]) => Promise<void>,
  dispatchCreateNewFolder: (path: string, rootDir: string) => Promise<void>,
  dispatchDeletePath: (path: string[]) => Promise<void>,
  dispatchRenamePath: (oldPath: string, newPath: string) => Promise<void>,
  dispatchCopyFile: (src: string, dest: string) => Promise<void>,
  dispatchCopyFolder: (src: string, dest: string) => Promise<void>,
  dispatchRunScript: (path: string) => Promise<void>,
  dispatchEmitContextMenuEvent: (cmd: customAction) => Promise<void>,
  dispatchHandleClickFile: (path: string, type: 'file' | 'folder' | 'gist') => Promise<void>
  dispatchHandleExpandPath: (paths: string[]) => Promise<void>,
  dispatchHandleDownloadFiles: () => Promise<void>,
  dispatchHandleRestoreBackup: () => Promise<void>
  dispatchCloneRepository: (url: string) => Promise<void>,
  dispatchMoveFile: (src: string, dest: string) => Promise<void>,
  dispatchMoveFolder: (src: string, dest: string) => Promise<void>,
  dispatchShowAllBranches: () => Promise<void>,
  dispatchSwitchToBranch: (branch: string) => Promise<void>,
  dispatchCreateNewBranch: (branch: string) => Promise<void>,
  dispatchCheckoutRemoteBranch: (branch: string, remote: string) => Promise<void>,
  dispatchCreateSolidityGithubAction: () => Promise<void>,
  dispatchCreateTsSolGithubAction: () => Promise<void>,
  dispatchCreateSlitherGithubAction: () => Promise<void>
}>(null)
  
    