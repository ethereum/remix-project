import React, { createContext, useEffect, useState } from 'react'
import { Profile } from '../customTypes'
import { RemixAppManager, RemixEngine, _Paq } from '../types'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

/* eslint-disable-next-line */
export interface RemixUiPluginManagerProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => void
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
}

export const PluginManagerContext = createContext({})

function PluginManagerContextProvider ({ children }) {
  const [globalState] = useState<RemixUiPluginManagerProps>({} as RemixUiPluginManagerProps)
  return (
    <PluginManagerContext.Provider value={globalState}>
      {children}
    </PluginManagerContext.Provider>
  )
}

// // Filtering helpers
//   const isFiltered = (profile) => (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(this.filter)
//   const isNotRequired = (profile) => !this.appManager.isRequired(profile.name)
//   const isNotDependent = (profile) => !this.appManager.isDependent(profile.name)
//   const isNotHome = (profile) => profile.name !== 'home'
//   const sortByName = (profileA, profileB) => {
//     const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
//     const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
//     return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
//   }

//   // Filter all active and inactive modules that are not required
//   const { actives, inactives } = this.appManager.getAll()
//     .filter(isFiltered)
//     .filter(isNotRequired)
//     .filter(isNotDependent)
//     .filter(isNotHome)
//     .sort(sortByName)
//     .reduce(({ actives, inactives }, profile) => {
//       return this.isActive(profile.name)
//         ? { actives: [...actives, profile], inactives }
//         : { inactives: [...inactives, profile], actives }
//     }, { actives: [], inactives: [] })

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  const [isFiltered] = useState((profile) =>
    (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(props.filter))
  const [isNotRequired, setIsNotRequired] = useState<boolean>(false)
  const [isNotDependent, setIsNotDependent] = useState((profile) => !props.appManager.isDependent(profile.name))
  const [isNotHome, setIsNotHome] = useState((profile) => profile.name !== 'home')
  const [sortByName, setSortByName] = useState<1 | -1 | 0>((profileA, profileB) => {
    const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
    const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
  })
  const { actives, inactives } = props.appManager.getAll()
    .filter(isFiltered)
    .filter(isNotRequired)
    .filter(isNotDependent)
    .filter(isNotHome)
    .sort(sortByName)
    .reduce(({ actives, inactives }, profile) => {
      return this.isActive(profile.name)
        ? { actives: [...actives, profile], inactives }
        : { inactives: [...inactives, profile], actives }
    }, { actives: [], inactives: [] })
  useEffect(() => {
    const notRequired = (profile: Profile) => !props.appManager.isRequired(profile.name)
    setIsNotRequired(notRequired(props.profile))
  })

  return (
    <PluginManagerContextProvider>
      <RootView
        openLocalPlugins={props.openLocalPlugin}
        filterPlugins={props.filterPlugins}
        activeProfiles
      />
    </PluginManagerContextProvider>
  )
}
