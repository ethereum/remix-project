import React from 'react'
import ActiveTile from './activeTile'

interface RowViewProps {
  localPluginButtonText: string

}

function RootView () {
  return (
    <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
      <header className="form-group pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
        <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
        <button className="btn btn-secondary text-dark border-0" data-id="pluginManagerComponentPluginSearchButton">Connect to a Local Plugin</button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActiveTile />
        <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">

        </div>
      </section>
    </div>
  )
}

export default RootView
