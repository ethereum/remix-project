import { Profile } from '@remixproject/plugin-utils'
import React, { Fragment, useEffect, useState } from 'react'
import { PluginManagerComponent } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
}
function InactivePluginCardContainer ({ pluginComponent }: InactivePluginCardContainerProps) {
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>()
  const [inactiveProfiles, setinactiveProfiles] = useState<Profile[]>([])

  const activatePlugin = (profile: Profile) => {
    pluginComponent.activateP(profile.name)
  }

  useEffect(() => {
    const savedInactiveProfiles = JSON.parse(localStorage.getItem('updatedInactives'))
    if (savedInactiveProfiles === null) {
      localStorage.setItem('updatedInactives', '[]')
    }
    if (pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length > 0) {
      setinactiveProfiles(pluginComponent.inactivePlugins)
    } else if (savedInactiveProfiles && pluginComponent.inactivePlugins.length > savedInactiveProfiles.length) {
      setinactiveProfiles(savedInactiveProfiles)
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
          setInactivePlugins={setinactiveProfiles}
          inactivePlugins={inactiveProfiles}
          activePlugins={activeProfiles}
          setActivePlugins={setActiveProfiles}
          pluginComponent={pluginComponent}
        />
      ))
      }
    </Fragment>
  )
}

export default InactivePluginCardContainer
