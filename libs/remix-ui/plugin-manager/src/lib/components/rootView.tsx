import React, { Fragment, useContext } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'
import ModuleHeading from './moduleHeading'
import PluginCard from './pluginCard'

interface RootViewProps {
  localPluginButtonText: string
}

function RootView ({ localPluginButtonText }: RootViewProps) {
  const { actives, inactives } = useContext(PluginManagerContext)
  return (
    <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
      <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
        <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
        <button className="remixui_pluginSearchButton btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
          Connect to a Local Plugin
        </button>
      </header>
      <section data-id="pluginManagerComponentPluginManagerSection">
        {actives.length === 0 ? (
          <Fragment>
            <ModuleHeading headingLabel="Active Modules"/>
            {actives.map((profile) => (
              <PluginCard profile={profile}/>
            ))}
          </Fragment>
        ) : null }
        {inactives.length === 0 ? (
          <Fragment>
            <ModuleHeading headingLabel="Inactive Modules"/>
            {inactives.map((profile) => (
              <PluginCard profile={profile}/>
            ))}
          </Fragment>
        ) : null}
      </section>
    </div>
  )
}

export default RootView
