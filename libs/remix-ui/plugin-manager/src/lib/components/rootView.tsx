import React from 'react'
import { Profile } from '../../customTypes'
import ActiveTile from './activeTile'
import ListGroupItem from './listGroupItem'

interface RootViewProps {
  localPluginButtonText: string
  activeProfiles: Profile[]
  inactiveProfiles?: Profile[]
  filterPlugins: () => void
  openLocalPlugins: () => void
  renderItem: (profile: Profile) => void
}

function RootView ({
  localPluginButtonText,
  activeProfiles,
  inactiveProfiles,
  filterPlugins,
  openLocalPlugins,
  renderItem
}: RootViewProps) {
  return (
    <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
      <header className="form-group pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
        <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
        <button className="btn btn-secondary text-dark border-0" data-id="pluginManagerComponentPluginSearchButton">{localPluginButtonText}</button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActiveTile />
        <ListGroupItem
          activeProfiles={activeProfiles}
          inactiveProfiles={inactiveProfiles}
          renderItem={renderItem}
        />
      </section>
    </div>
  )
}

export default RootView
