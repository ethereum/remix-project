import { Profile } from '@remixproject/plugin-utils'
import React, { Fragment, useEffect, useState } from 'react'
import { PluginManagerComponent, PluginManagerProfile } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
}

interface LocalPluginInterface {
  profile: Partial<PluginManagerProfile> // { name: string, displayName: string, url: string, type: 'iframe' | 'ws', hash: string, methods: string, location: 'sidePanel' | 'mainPanel' | 'none'}
  activateService: {}
  requestQueue: []
  options: { queueTimeout: number }
  id: number
  pendingRequest: {}
  listener: []
  iframe: {}
}
function InactivePluginCardContainer ({ pluginComponent }: InactivePluginCardContainerProps) {
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>()
  const [inactiveProfiles, setinactiveProfiles] = useState<Profile[]>([])
  const activatePlugin = (profile: Profile) => {
    pluginComponent.activateP(profile.name)
  }

  useEffect(() => {
    const savedInactiveProfiles: Profile[] = JSON.parse(localStorage.getItem('updatedInactives'))
    const savedLocalPlugins: LocalPluginInterface = JSON.parse(localStorage.getItem('plugins/local'))
    if (savedInactiveProfiles && savedInactiveProfiles.length > 0 && pluginComponent.inactivePlugins.length > savedInactiveProfiles.length) {
      if (Object.keys(savedLocalPlugins).length > 0 && !pluginComponent.inactivePlugins.includes(savedLocalPlugins.profile as Profile)) {
        const inactiveLocalPlugin = savedLocalPlugins.profile
        localStorage.setItem('currentLocalPlugin', inactiveLocalPlugin.name)
        savedInactiveProfiles.push(inactiveLocalPlugin as Profile)
      }
      setinactiveProfiles(savedInactiveProfiles)
    } else if (pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length > 0) {
      const temp = []
      if (Object.keys(savedLocalPlugins).length > 0) {
        const inactiveLocalPlugin = savedLocalPlugins.profile
        localStorage.setItem('currentLocalPlugin', inactiveLocalPlugin.name)
        temp.push([...pluginComponent.inactivePlugins, inactiveLocalPlugin])
        setinactiveProfiles(temp)
      }
      setinactiveProfiles(pluginComponent.inactivePlugins)
    }
  }, [pluginComponent, pluginComponent.inactivePlugins])
  return (
    <Fragment>
      {(inactiveProfiles && inactiveProfiles.length) ? <ModuleHeading headingLabel="Inactive Modules" count={inactiveProfiles.length} /> : null}
      {inactiveProfiles && inactiveProfiles.map(profile => (
        <InactivePluginCard
          buttonText="Activate"
          profile={profile}
          key={profile.name}
          activatePlugin={activatePlugin}
        />
      ))
      }
    </Fragment>
  )
}

export default InactivePluginCardContainer
