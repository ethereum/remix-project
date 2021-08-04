import React from 'react'
import { PluginManagerComponent, RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export function getSolidity (pluginComponent: PluginManagerComponent) {
  const fetchSolidity = async () => {
    const solidity = await pluginComponent.appManager.getProfile('solidity')
    const solidityLogic = await pluginComponent.appManager.getProfile('solidity-logic')
    return [solidity, solidityLogic]
  }
  const materializeFetch = fetchSolidity()
  return materializeFetch
}

export function getWorkspacePluginNames () {
  const workspace: string[] = JSON.parse(localStorage.getItem('workspace'))
  return workspace
}

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  return (
    <RootView pluginComponent={pluginComponent}>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActivePluginCardContainer
          pluginComponent={pluginComponent}
        />
        <InactivePluginCardContainer
          pluginComponent={pluginComponent}
        />
      </section>
    </RootView>
  )
}
