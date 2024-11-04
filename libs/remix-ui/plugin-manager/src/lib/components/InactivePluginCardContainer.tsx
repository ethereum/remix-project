/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React from 'react' // eslint-disable-line no-use-before-define
import { useIntl } from 'react-intl'
import { PluginManagerComponent } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
}

function InactivePluginCardContainer({ pluginComponent }: InactivePluginCardContainerProps) {
  const activatePlugin = (pluginName: string) => {
    pluginComponent.activateP(pluginName)
  }

  const intl = useIntl()

  return (
    <React.Fragment>
      {pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length ? (
        <ModuleHeading
          headingLabel={intl.formatMessage({
            id: 'pluginManager.inactiveModules'
          })}
          count={pluginComponent.inactivePlugins.length}
        />
      ) : null}
      {pluginComponent.inactivePlugins &&
        pluginComponent.inactivePlugins.map((profile, idx) => {
          return <InactivePluginCard
            buttonText={intl.formatMessage({ id: 'pluginManager.activate' })}
            profile={profile}
            key={idx}
            activatePlugin={activatePlugin}
          />
        })}
    </React.Fragment>
  )
}

export default InactivePluginCardContainer
