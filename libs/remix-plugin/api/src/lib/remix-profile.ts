import { ProfileMap, Profile } from '@remixproject/plugin-utils'
import { compilerProfile, ICompiler } from './compiler'
import { filSystemProfile, IFileSystem } from './file-system/file-manager'
import { editorProfile, IEditor } from './editor'
import { networkProfile, INetwork } from './network'
import { udappProfile, IUdapp } from './udapp'
import { themeProfile, ITheme } from './theme'
import { unitTestProfile, IUnitTesting } from './unit-testing'
import { contentImportProfile, IContentImport } from './content-import'
import { ISettings, settingsProfile } from './settings'
import { gitProfile, IGitSystem } from './git';
import { IVScodeExtAPI, vscodeExtProfile } from './vscextapi';
import { IPluginManager, pluginManagerProfile } from './plugin-manager'
import { filePanelProfile, IFilePanel } from './file-system/file-panel'
import { dGitProfile, IDgitSystem } from './dgit'
import { ITerminal, terminalProfile } from './terminal'

export interface IRemixApi {
  manager: IPluginManager,
  solidity: ICompiler
  fileManager: IFileSystem
  filePanel: IFilePanel
  dGitProvider: IDgitSystem
  solidityUnitTesting: IUnitTesting
  editor: IEditor
  network: INetwork
  udapp: IUdapp
  contentImport: IContentImport
  settings: ISettings
  theme: ITheme
  vscodeExtAPI: IVScodeExtAPI
  terminal: ITerminal
}

export type RemixApi = Readonly<IRemixApi>

/** @deprecated Use remixProfiles instead. Will be remove in next version */
export const remixApi: ProfileMap<RemixApi> = Object.freeze({
  manager: pluginManagerProfile,
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  dGitProvider: dGitProfile,
  filePanel: filePanelProfile,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  settings: settingsProfile,
  theme: themeProfile,
  vscodeExtAPI: vscodeExtProfile,
  terminal: terminalProfile
})

/** Profiles of all the remix's Native Plugins */
export const remixProfiles: ProfileMap<RemixApi> = Object.freeze({
  manager: pluginManagerProfile,
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  git: { ...gitProfile, name: 'git' } as Profile<IGitSystem>,
  dGitProvider: dGitProfile,
  filePanel: filePanelProfile,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  settings: settingsProfile,
  theme: themeProfile,
  vscodeExtAPI: vscodeExtProfile,
  terminal: terminalProfile
})
