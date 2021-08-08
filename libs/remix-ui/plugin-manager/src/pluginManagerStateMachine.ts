import { Profile } from '@remixproject/plugin-utils'
import { useState } from 'react'
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

export async function CheckSolidity (pluginComponent: PluginManagerComponent, workspacePlugins: string[]) {
  if (workspacePlugins.includes('solidity') === true && workspacePlugins.includes('solidity-logic') === true) {
    if (pluginComponent.activeProfiles.includes('solidity') && pluginComponent.activeProfiles.includes('solidity-logic')) {
      const result = await getSolidity(pluginComponent)
      if (result && result.length > 0) {
        return result
      }
    } else {
      return []
    }
  }
}
