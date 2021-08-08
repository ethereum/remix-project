import { Profile } from '@remixproject/plugin-utils'
import React, { Fragment, useEffect } from 'react'
import { PluginManagerComponent, PluginManagerProfile } from '../../types'
import InactivePluginCard from './InactivePluginCard'
import ModuleHeading from './moduleHeading'

interface InactivePluginCardContainerProps {
  pluginComponent: PluginManagerComponent
  setInactiveProfiles: React.Dispatch<React.SetStateAction<Profile<any>[]>>
  inactiveProfiles: Profile<any>[]
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
function InactivePluginCardContainer ({ pluginComponent, setInactiveProfiles, inactiveProfiles }: InactivePluginCardContainerProps) {
  const activatePlugin = (profile: Profile) => {
    pluginComponent.activateP(profile.name)
  }

  useEffect(() => {
    const savedInactiveProfiles: Profile[] = JSON.parse(localStorage.getItem('updatedInactives'))
    const savedLocalPlugins: LocalPluginInterface = JSON.parse(localStorage.getItem('plugins/local'))
    const savedActiveProfiles: Profile[] = JSON.parse(localStorage.getItem('newActivePlugins'))
    if (savedInactiveProfiles && savedInactiveProfiles.length) {
      if (Object.keys(savedLocalPlugins).length > 0 && !pluginComponent.inactivePlugins.includes(savedLocalPlugins.profile as Profile)) {
        const inactiveLocalPlugin = savedLocalPlugins.profile
        localStorage.setItem('currentLocalPlugin', inactiveLocalPlugin.name)
        savedInactiveProfiles.push(inactiveLocalPlugin as Profile)
      }
      // setinactiveProfiles(savedInactiveProfiles)
    } else if (pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length > 0) {
      let temp: Profile[] = []
      if (Object.keys(savedLocalPlugins).length > 0) {
        const inactiveLocalPlugin = savedLocalPlugins.profile
        localStorage.setItem('currentLocalPlugin', inactiveLocalPlugin.name)
      }
      if (Object.keys(savedLocalPlugins).length) {
        temp = [...pluginComponent.inactivePlugins, savedLocalPlugins.profile as Profile]
      } else {
        temp = [...pluginComponent.inactivePlugins]
      }
      const filtered = temp.filter(t => {
        return !savedActiveProfiles.find(active => {
          return active.name === t.name
        })
      })
      console.log(filtered)
      setInactiveProfiles(filtered)
    }
  }, [pluginComponent, pluginComponent.inactivePlugins, setInactiveProfiles])
  return (
    <Fragment>
      {(inactiveProfiles && inactiveProfiles.length) ? <ModuleHeading headingLabel="Inactive Modules" count={inactiveProfiles.length} /> : null}
      {inactiveProfiles && inactiveProfiles.map((profile, idx) => (
        <InactivePluginCard
          buttonText="Activate"
          profile={profile}
          key={profile.name || idx}
          activatePlugin={activatePlugin}
        />
      ))
      }
    </Fragment>
  )
}

export default InactivePluginCardContainer
