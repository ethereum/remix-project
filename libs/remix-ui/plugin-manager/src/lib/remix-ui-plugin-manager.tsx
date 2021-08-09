import { Profile } from '@remixproject/plugin-utils'
import React, { useState } from 'react'
import { RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>(pluginComponent.activePlugins)
  const [inactiveProfiles, setinactiveProfiles] = useState<Profile[]>(pluginComponent.inactivePlugins)
  if (JSON.parse(localStorage.getItem('newActivePlugins')) === null) {
    localStorage.setItem('newActivePlugins', '[]')
  }
  if (JSON.parse(localStorage.getItem('plugins/local')) === null) {
    localStorage.setItem('plugins/local', '{}')
  }
  if (JSON.parse(localStorage.getItem('activatedPluginNames'))) {
    localStorage.setItem('activatedPluginNames', '[]')
  }

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
