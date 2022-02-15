/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React from 'react' // eslint-disable-line no-use-before-define
import { PluginManagerComponent } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
  setInactiveProfiles: React.Dispatch<React.SetStateAction<Profile<any>[]>>
  inactiveProfiles: Profile<any>[]
}

function InactivePluginCardContainer ({ pluginComponent }: InactivePluginCardContainerProps) {
  const activatePlugin = (pluginName: string) => {
    pluginComponent.activateP(pluginName)
  }

  return (
    <React.Fragment>
      {(pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length) ? <ModuleHeading headingLabel="Inactive Modules" count={pluginComponent.inactivePlugins.length} /> : null}
      {pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.map((profile, idx) => {
        return (
          <InactivePluginCard
            buttonText="Activate"
            profile={profile}
            key={idx}
            activatePlugin={activatePlugin}
          />
        )
      })
      }
    </React.Fragment>
  )
}

export default InactivePluginCardContainer
