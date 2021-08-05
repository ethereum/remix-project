import { PluginManagerComponent } from './types'

export const defaultActivatedPlugins = [
  'manager',
  'contentImport',
  'theme',
  'editor',
  'fileManager',
  'compilerMetadata',
  'compilerArtefacts',
  'network',
  'web3Provider',
  'offsetToLineColumnConverter',
  'mainPanel',
  'menuicons',
  'tabs',
  'sidePanel',
  'home',
  'hiddenPanel',
  'contextualListener',
  'terminal',
  'fetchAndCompile',
  'pluginManager',
  'filePanel',
  'settings',
  'udapp'
]

export function getSolidity (pluginComponent: PluginManagerComponent) {
  const fetchSolidity = async () => {
    const solidity = await pluginComponent.appManager.getProfile('solidity')
    const solidityLogic = await pluginComponent.appManager.getProfile('solidity-logic')
    return [solidity, solidityLogic]
  }
  const materializeFetch = fetchSolidity()
  return materializeFetch
}
