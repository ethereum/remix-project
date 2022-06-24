/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React from 'react' // eslint-disable-line no-use-before-define
import { useIntl } from 'react-intl'
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

  const intl = useIntl();

  return (
    <React.Fragment>
      {(pluginComponent.activePlugins && pluginComponent.activePlugins.length) ? <ModuleHeading headingLabel={intl.formatMessage({id: 'pluginManager.activeModules' , defaultMessage: 'Active Modules'})} count={pluginComponent.activePlugins.length} /> : null}
      {pluginComponent.activePlugins && pluginComponent.activePlugins.map((profile, idx) => {
        return (
          <ActivePluginCard
            buttonText={intl.formatMessage({id: 'pluginManager.deactivate' , defaultMessage: 'Deactivate'})}
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
