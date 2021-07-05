import React from 'react'
import { Profile, TileLabel } from '../../customTypes'
import ActiveTile from './activeTile'
import ListGroupItem from './listGroupItem'

interface RootViewProps {
  localPluginButtonText: string
  activeProfiles: Profile[]
  inactiveProfiles?: Profile[]
  filterPlugins: () => void
  openLocalPlugins: () => void
  tileLabel: TileLabel
}

function RootView ({
  localPluginButtonText,
  activeProfiles,
  inactiveProfiles,
  filterPlugins,
  openLocalPlugins,
  tileLabel
}: RootViewProps) {
  return (
    <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
      <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
        <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
        <button className="btn btn-secondary text-dark border-0" data-id="pluginManagerComponentPluginSearchButton">{localPluginButtonText}</button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActiveTile
          activesCount={activeProfiles.length}
          inactivesCount={inactiveProfiles.length}
          tileLabel={tileLabel}
        />
        <ListGroupItem
          activeProfiles={activeProfiles}
          inactiveProfiles={inactiveProfiles}
        />
      </section>
    </div>
  )
}

export default RootView
