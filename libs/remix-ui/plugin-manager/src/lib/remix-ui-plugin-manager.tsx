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
  // const [, setWorkspacePlugins] = useState<string[]>([])

  // useEffect(() => {
  //   const newActives = localStorage.getItem('newActivePlugins')
  //   const updatedInactives = localStorage.getItem('updatedInactives')
  //   if (newActives === null && updatedInactives === null) {
  //     if (getWorkspacePluginNames().includes('solidity') && getWorkspacePluginNames().includes('solidity-logic')) {
  //       if (pluginComponent.activeProfiles.includes('solidity') && pluginComponent.activeProfiles.includes('solidity-logic')) {
  //         localStorage.setItem('newActivePlugins', JSON.stringify(getSolidity(pluginComponent)))
  //         const filteredInactives = pluginComponent.inactivePlugins.filter(inactive => inactive.name !== 'solidity' &&
  //           inactive.name !== 'solidity-logic')
  //       }
  //     }
  //     localStorage.setItem('newActivePlugins', '[]')
  //     localStorage.setItem('updatedInactives', '[]')
  //   }
  //   console.log('current Active Profiles from pluginComponent', pluginComponent.activeProfiles)
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pluginComponent.activePlugins, pluginComponent.activeProfiles, pluginComponent.inactivePlugins])
  // useEffect(() => {
  //   const workspaceLogic = async () => {
  //     const workspace = JSON.parse(localStorage.getItem('workspace'))
  //     const fromLocalStorage = JSON.parse(localStorage.getItem('newActivePlugins')) as Profile[]
  //     if (workspace && workspace.length > 0) {
  //       setWorkspacePlugins(workspace)
  //       if (workspace.includes('solidity') && workspace.includes('solidity-logic')) {
  //         const solidity = await pluginComponent.appManager.getProfile('solidity')
  //         const logic = await pluginComponent.appManager.getProfile('solidity-logic')
  //         const updates = [...fromLocalStorage, solidity, logic]
  //         localStorage.setItem('newActivePlugins', JSON.stringify(updates))
  //         // setActiveProfiles(updates)
  //       }
  //     }
  //   }
  //   workspaceLogic()
  //   return () => {
  //     console.log('finished second effect!')
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

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
