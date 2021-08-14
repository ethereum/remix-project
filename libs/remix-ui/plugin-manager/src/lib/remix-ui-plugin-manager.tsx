import { Profile } from '@remixproject/plugin-utils'
import React, { useEffect, useState } from 'react'
import { RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>(pluginComponent.activePlugins)
  const [inactiveProfiles, setinactiveProfiles] = useState<Profile[]>(pluginComponent.inactivePlugins)
  // const [activated] = useState<string[]>(pluginComponent.activeProfiles)

  // if (JSON.parse(localStorage.getItem('newActivePlugins')) === null) {
  //   localStorage.setItem('newActivePlugins', '[]')
  // }
  // if (JSON.parse(localStorage.getItem('plugins/local')) === null) {
  //   localStorage.setItem('plugins/local', '{}')
  // }
  // if (JSON.parse(localStorage.getItem('activatedPluginNames'))) {
  //   localStorage.setItem('activatedPluginNames', '[]')
  // }

  // useEffect(() => {
  //   console.log('first time into use effect the activated state is', activated)
  //   const checkSolidity = async () => {
  //     const savedActives: Profile[] = JSON.parse(localStorage.getItem('newActivePlugins'))
  //     if (activated.includes('solidity') && activated.includes('solidity-logic')) {
  //       if (savedActives && savedActives.length >= 0) {
  //         if (!savedActives.find(active => active.name === 'solidity') && !savedActives.find(active => active.name === 'solidity-logic')) {
  //           const solidity = await pluginComponent.appManager.getProfile('solidity')
  //           const logic = await pluginComponent.appManager.getProfile('solidity-logic')
  //           savedActives.push(solidity, logic)
  //         }
  //       }
  //     }
  //     console.log('Use effect called, activated state is', activated)
  //   }
  //   checkSolidity()
  //   console.log('activated state right at useEffect exit', activated)
  // }, [activated, pluginComponent.appManager])
  return (
    <RootView pluginComponent={pluginComponent}>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActivePluginCardContainer
          pluginComponent={pluginComponent}
          setActiveProfiles={setActiveProfiles}
          activeProfiles={activeProfiles}
        />
        <InactivePluginCardContainer
          pluginComponent={pluginComponent}
          setInactiveProfiles={setinactiveProfiles}
          inactiveProfiles={inactiveProfiles}
        />
      </section>
    </RootView>
  )
}
