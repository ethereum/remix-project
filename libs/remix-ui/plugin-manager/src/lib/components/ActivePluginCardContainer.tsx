import { Profile } from '@remixproject/plugin-utils'
import React, { Fragment, useEffect, useState } from 'react'
import { PluginManagerComponent } from '../../types'
import ActivePluginCard from './ActivePluginCard'
import ModuleHeading from './moduleHeading'

interface ActivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
  setActiveProfiles: React.Dispatch<React.SetStateAction<Profile<any>[]>>
  activeProfiles: Profile[]
}
function ActivePluginCardContainer ({ pluginComponent }: ActivePluginCardContainerProps) {
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>()
  const deactivatePlugin = (pluginName: string) => {
    pluginComponent.deactivateP(pluginName)
  }

  useEffect(() => {
    const savedActiveProfiles = JSON.parse(localStorage.getItem('newActivePlugins'))
    if (pluginComponent.activePlugins && pluginComponent.activePlugins.length > 0) {
      setActiveProfiles(pluginComponent.activePlugins)
    } else if (savedActiveProfiles && savedActiveProfiles.length > 0 && pluginComponent.activePlugins.length === 0) {
      setActiveProfiles(savedActiveProfiles)
    }
  }, [pluginComponent, pluginComponent.activePlugins])
  return (
    <Fragment>
      {(activeProfiles && activeProfiles.length) ? <ModuleHeading headingLabel="Active Modules" count={activeProfiles.length} /> : null}
      {activeProfiles && activeProfiles.map((profile, idx) => (
        <ActivePluginCard
          buttonText="Deactivate"
          profile={profile}
          deactivatePlugin={deactivatePlugin}
          key={idx}
          activePlugins={activeProfiles}
          setActivePlugins={setActiveProfiles}
        />
      ))
      }
    </Fragment>
  )
}

export default ActivePluginCardContainer
