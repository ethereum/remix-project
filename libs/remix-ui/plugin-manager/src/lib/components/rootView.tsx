import React from 'react'
import ActiveTile from './activeTile'
import ListGroupItem from './listGroupItem'

interface RootViewProps {
  localPluginButtonText: string
}

function RootView ({ localPluginButtonText }: RootViewProps) {
  // const { actives, inactives, tileLabel } = useContext(PluginManagerContext)
  return (
  // <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
  //   <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
  //     <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
  //     <button className="btn btn-secondary text-dark border-0" data-id="pluginManagerComponentPluginSearchButton">{localPluginButtonText}</button>
  //   </header>
  //   <section data-id="pluginManagerComponentPluginManagerSection">
  //     <ActiveTile
  //       activesCount={actives.length}
  //       inactivesCount={inactives.length}
  //       tileLabel={tileLabel}
  //     />
  //     <ListGroupItem
  //       activeProfiles={actives}
  //       inactiveProfiles={inactives}
  //     />
  //   </section>
  // </div>

    <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
      <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
        <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
        <button className="btn btn-secondary text-dark border-0" data-id="pluginManagerComponentPluginSearchButton">Connect to a local Plugin</button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActiveTile headingLabel="Active Modules"/>
        <ActiveTile headingLabel="Inactive Modules"/>
        <ListGroupItem />
      </section>
    </div>
  )
}

export default RootView
