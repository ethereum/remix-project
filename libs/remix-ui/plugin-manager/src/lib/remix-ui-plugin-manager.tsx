/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState } from 'react' // eslint-disable-line no-use-before-define
import { RemixUiPluginManagerProps } from '../types'
import PluginCard from './components/PluginCard'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  const [activeTab, setActiveTab] = useState('all')
  const [filterByRemix, setFilterByRemix] = useState<boolean>(false)

  const togglePlugin = (pluginName: string) => {
    const isActive = pluginComponent.activePlugins.some(p => p.name === pluginName)
    if (isActive) {
      pluginComponent.deactivateP(pluginName)
    } else {
      pluginComponent.activateP(pluginName)
    }
  }

  const renderPluginList = () => {
    let pluginsToRender: Profile[] = []
    switch (activeTab) {
      case 'active':
        pluginsToRender = pluginComponent.activePlugins
        break
      case 'inactive':
        pluginsToRender = pluginComponent.inactivePlugins
        break
      case 'all':
      default:
        pluginsToRender = [...pluginComponent.activePlugins, ...pluginComponent.inactivePlugins]
        break
    }

    if (filterByRemix) {
      pluginsToRender = pluginsToRender.filter(profile => profile.maintainedBy?.toLowerCase() === 'remix')
    }

    return pluginsToRender.map((profile, idx) => {
      const isActive = pluginComponent.activePlugins.some(p => p.name === profile.name)
      return <PluginCard profile={profile} isActive={isActive} togglePlugin={togglePlugin} key={profile.name || idx} />
    })
  }

 return (
    <RootView pluginComponent={pluginComponent} filterByRemix={filterByRemix} setFilterByRemix={setFilterByRemix}>
      <section data-id="pluginManagerComponentPluginManagerSection" className="px-3">
        <nav className="nav plugin-manager-tabs mt-2 d-flex flex-row">
          <a className={`nav-item nav-link mr-3 ${activeTab === 'all' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('all')}>
            All plugins <span className="badge badge-secondary">{pluginComponent.activePlugins.length + pluginComponent.inactivePlugins.length}</span>
          </a>
          <a className={`nav-item nav-link mr-3 ${activeTab === 'active' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('active')}>
            Active <span className="badge badge-secondary">{pluginComponent.activePlugins.length}</span>
          </a>
          <a className={`nav-item nav-link ${activeTab === 'inactive' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('inactive')}>
            Inactive <span className="badge badge-secondary">{pluginComponent.inactivePlugins.length}</span>
          </a>
        </nav>

        <div className="mt-3">{renderPluginList()}</div>
      </section>
    </RootView>
  )
}