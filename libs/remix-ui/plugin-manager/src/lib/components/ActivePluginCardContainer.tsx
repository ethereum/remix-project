/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React from 'react' // eslint-disable-line no-use-before-define
import { PluginManagerComponent } from '../../types'
import ActivePluginCard from './ActivePluginCard'
import ModuleHeading from './moduleHeading'

interface ActivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
  setActiveProfiles: React.Dispatch<React.SetStateAction<Profile<any>[]>>
  activeProfiles: Profile[]
}
function ActivePluginCardContainer ({ pluginComponent }: ActivePluginCardContainerProps) {
  const deactivatePlugin = (pluginName: string) => {
    pluginComponent.deactivateP(pluginName)
  }

  return (
    <React.Fragment>
      {(pluginComponent.activePlugins && pluginComponent.activePlugins.length) ? <ModuleHeading headingLabel="Active Modules" count={pluginComponent.activePlugins.length} /> : null}
      {pluginComponent.activePlugins && pluginComponent.activePlugins.map((profile, idx) => {
        return (
          <ActivePluginCard
            buttonText="Deactivate"
            profile={profile}
            deactivatePlugin={deactivatePlugin}
            key={idx}
          />
        )
      })
      }
    </React.Fragment>
  )
}

export default ActivePluginCardContainer
