import React, { createContext, useState } from 'react'
import { Profile } from '../../customTypes'
import * as packageJson from '../../../../../../package.json'
// export interface RemixUiPluginManagerProps {
//   activatePlugin: (name: string) => void
//   deActivatePlugin: (name: string) => void
//   isActive: () => void
//   openLocalPlugin: () => Promise<void>
//   filterPlugins: () => void
//   reRender: () => void
//   profile: Profile
// }

export const PluginManagerContext = createContext({})

function PluginManagerContextProvider ({ children }) {
  const [profile] = useState<Profile>({
    name: 'pluginManager',
    displayName: 'Plugin manager',
    methods: [],
    events: [],
    icon: 'assets/img/pluginManager.webp',
    description: 'Start/stop services, modules and plugins',
    kind: 'settings',
    location: 'sidePanel',
    documentation: 'https://remix-ide.readthedocs.io/en/latest/plugin_manager.html',
    version: packageJson.version
  })
  return (
    <PluginManagerContext.Provider value={profile}>
      {children}
    </PluginManagerContext.Provider>
  )
}

export default PluginManagerContextProvider
