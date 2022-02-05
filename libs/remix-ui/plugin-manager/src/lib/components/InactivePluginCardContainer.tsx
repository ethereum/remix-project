import { Profile } from '@remixproject/plugin-utils'
import { PluginManagerComponent, PluginManagerProfile } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
  setInactiveProfiles: React.Dispatch<React.SetStateAction<Profile<any>[]>>
  inactiveProfiles: Profile<any>[]
}

interface LocalPluginInterface {
  profile: Partial<PluginManagerProfile>
  activateService: {}
  requestQueue: []
  options: { queueTimeout: number }
  id: number
  pendingRequest: {}
  listener: []
  iframe: {}
}
function InactivePluginCardContainer ({ pluginComponent }: InactivePluginCardContainerProps) {
  const activatePlugin = (pluginName: string) => {
    pluginComponent.activateP(pluginName)
  }

  return (
    <>
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
    </>
  )
}

export default InactivePluginCardContainer
