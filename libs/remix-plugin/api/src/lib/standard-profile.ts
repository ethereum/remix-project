import { ProfileMap, Profile, ApiMap } from '@remixproject/plugin-utils'
import { compilerProfile, ICompiler } from './compiler'
import { filSystemProfile, IFileSystem } from './file-system/file-manager'
import { editorProfile, IEditor } from './editor'
import { networkProfile, INetwork } from './network'
import { udappProfile, IUdapp } from './udapp'
import { IPluginManager, pluginManagerProfile } from './plugin-manager'

export interface IStandardApi {
  manager: IPluginManager,
  solidity: ICompiler
  fileManager: IFileSystem
  editor: IEditor
  network: INetwork
  udapp: IUdapp
}

export type StandardApi = Readonly<IStandardApi>

/** Profiles of all the standard's Native Plugins */
export const standardProfiles: ProfileMap<StandardApi> = Object.freeze({
  manager: pluginManagerProfile,
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
})
