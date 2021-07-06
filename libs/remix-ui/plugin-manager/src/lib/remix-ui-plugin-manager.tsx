import React, { createContext, useEffect, useState } from 'react'
import { Profile, TileLabel } from '../customTypes'
import { RemixAppManager, RemixEngine, _Paq } from '../types'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

/* eslint-disable-next-line */
export interface PluginManagerContextProviderProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => any
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  tileLabel: TileLabel
}

export interface RemixUiPluginManagerProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => any
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  tileLabel: TileLabel
}

export const PluginManagerContext = createContext<Partial<PluginManagerContextProviderProps>>({})

function PluginManagerContextProvider ({ children, props }) {
  const [isFiltered] = useState((profile) =>
    (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(props.filter))
  const [isNotRequired, setIsNotRequired] = useState<any>()
  const [isNotDependent, setIsNotDependent] = useState<any>()
  const [isNotHome, setIsNotHome] = useState<any>()
  const [sortByName, setSortByName] = useState<any>()
  const { actives, inactives } = props.appManager.getAll()
    .filter(isFiltered)
    .filter(isNotRequired)
    .filter(isNotDependent)
    .filter(isNotHome)
    .sort(sortByName)
    .reduce(({ actives, inactives }, profile) => {
      return props.isActive(profile.name)
        ? { actives: [...actives, profile], inactives }
        : { inactives: [...inactives, profile], actives }
    }, { actives: [], inactives: [] })
  props.actives = actives
  props.inactives = inactives
  useEffect(() => {
    const notRequired = (profile: Profile) => !props.appManager.isRequired(profile.name)
    const notDependent = (profile) => !props.appManager.isDependent(profile.name)
    const notHome = (profile) => profile.name !== 'home'
    const sortedByName = (profileA: Profile, profileB: Profile) => {
      const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
      const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    }
    setIsNotRequired(notRequired(props.profile))
    setIsNotDependent(notDependent(notDependent))
    setIsNotHome(notHome)
    setSortByName(sortedByName)
  }, [props.appManager, props.profile])
  return (
    <PluginManagerContext.Provider value={...props}>
      {children}
    </PluginManagerContext.Provider>
  )
}

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  return (
    <PluginManagerContextProvider props>
      <RootView
        localPluginButtonText="Connect to a Local Plugin"
      />
    </PluginManagerContextProvider>
  )
}
