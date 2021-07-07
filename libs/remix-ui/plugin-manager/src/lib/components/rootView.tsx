import React from 'react'
import ListGroupItem from './listGroupItem'
import ModuleHeading from './moduleHeading'

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
        <button className="remixui_pluginSearchButton btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
          Connect to a Local Plugin
        </button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ModuleHeading headingLabel="Active Modules"/>
        <ModuleHeading headingLabel="Inactive Modules"/>
        <ListGroupItem />
      </section>
    </div>
  )
}

export default RootView
