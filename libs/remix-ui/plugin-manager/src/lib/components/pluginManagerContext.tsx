import { Profile } from '@remixproject/plugin-utils'
import React, { createContext, useEffect, useState } from 'react'
import { PluginManagerContextProviderProps } from '../../types'

interface PluginManagerContextInterface {
  trackActiveProfiles: Profile[]
  trackInactiveProfiles: Profile[]
  setTrackActiveProfiles: React.Dispatch<Profile[]>
  setTrackInactiveProfiles: React.Dispatch<Profile[]>
}

export const PluginManagerContext = createContext<PluginManagerContextInterface>(null)

function PluginManagerContextProvider ({ children, pluginComponent }: PluginManagerContextProviderProps) {
  const [trackActiveProfiles, setTrackActiveProfiles] = useState([])
  const [trackInactiveProfiles, setTrackInactiveProfiles] = useState([])

  useEffect(() => {
    const checkedActives = JSON.parse(localStorage.getItem('newActivePlugins'))
    if (checkedActives && checkedActives.length > 0) {
      setTrackActiveProfiles([...trackActiveProfiles, ...checkedActives])
    } else {
      localStorage.setItem('newActivePlugins', JSON.stringify(trackActiveProfiles))
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackActiveProfiles])
  useEffect(() => {
    const checkedInactives = JSON.parse(localStorage.getItem('updatedInactives'))
    if (checkedInactives && checkedInactives.length > 0 && trackInactiveProfiles.length === 0) {
      setTrackInactiveProfiles([...pluginComponent.inactivePlugins, ...checkedInactives])
    } else {
      localStorage.setItem('updatedInactives', JSON.stringify(trackInactiveProfiles))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginComponent.inactivePlugins])
  return (
    <PluginManagerContext.Provider value={{ trackActiveProfiles, trackInactiveProfiles, setTrackActiveProfiles, setTrackInactiveProfiles }}>
      {children}
    </PluginManagerContext.Provider>
  )
}

export default PluginManagerContextProvider
