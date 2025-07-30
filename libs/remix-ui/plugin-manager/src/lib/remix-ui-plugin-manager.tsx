/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState, useRef, useEffect } from 'react' // eslint-disable-line no-use-before-define
import { RemixUiPluginManagerProps } from '../types'
import PluginCard from './components/PluginCard'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  const [activeTab, setActiveTab] = useState('all')
  const [filterByRemix, setFilterByRemix] = useState<boolean>(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  const togglePlugin = (pluginName: string) => {
    const isActive = pluginComponent.activePlugins.some(p => p.name === pluginName)
    if (isActive) {
      pluginComponent.deactivateP(pluginName)
    } else {
      pluginComponent.activateP(pluginName)
    }
  }

useEffect(() => {
    const tabsNode = tabsRef.current
    if (!tabsNode) return

    const updateIndicator = () => {
      const activeLink = tabsNode.querySelector('.nav-link.active') as HTMLElement
      if (activeLink) {
        tabsNode.style.setProperty('--indicator-left', `${activeLink.offsetLeft}px`)
        tabsNode.style.setProperty('--indicator-width', `${activeLink.offsetWidth}px`)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator()
    })
    resizeObserver.observe(tabsNode)
    updateIndicator()

    return () => {
      resizeObserver.disconnect()
    }
  }, [activeTab])


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
        <nav ref={tabsRef} className="plugin-manager-tabs mt-2 d-flex flex-row">
          <a className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('all'); }}>
            <div className={activeTab === 'all' ? 'card-title' : ''}>
              All plugins <span className="badge">{pluginComponent.activePlugins.length + pluginComponent.inactivePlugins.length}</span>
            </div>
          </a>
          <a className={`nav-link ${activeTab === 'active' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('active'); }}>
            <div className={activeTab === 'active' ? 'card-title' : ''}>
              Active <span className="badge">{pluginComponent.activePlugins.length}</span>
            </div>
          </a>
          <a className={`nav-link ${activeTab === 'inactive' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('inactive'); }}>
            <div className={activeTab === 'inactive' ? 'card-title' : ''}>
              Inactive <span className="badge">{pluginComponent.inactivePlugins.length}</span>
            </div>
          </a>
        </nav>
        <div className="mt-3">{renderPluginList()}</div>
      </section>
    </RootView>
  )
}