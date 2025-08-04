/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState, useRef, useEffect } from 'react' // eslint-disable-line no-use-before-define
import { RemixUiPluginManagerProps } from '../types'
import PluginCard from './components/PluginCard'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

const pluginCategories: Record<string, string[]> = {
  // --- Layer 2 & Scaling ---
  'arbitrum-stylus': ['Deployment & Verification', 'Layer 2 & Scaling'],
  'nahmii-compiler': ['Core Tools', 'Layer 2 & Scaling', 'Alternative Languages'],
  'Starknet': ['Core Tools', 'Layer 2 & Scaling', 'Alternative Languages'],
  'ZKsync': ['Deployment & Verification', 'Layer 2 & Scaling', 'ZK (Zero-Knowledge)'],

  // --- ZK (Zero-Knowledge) ---
  'circuit-compiler': ['Core Tools', 'ZK (Zero-Knowledge)', 'Alternative Languages'],
  'noir-compiler': ['Core Tools', 'ZK (Zero-Knowledge)', 'Alternative Languages'],
  'ZoKrates': ['Core Tools', 'ZK (Zero-Knowledge)'],

  // --- Security & Analysis ---
  'contract-verification': ['Deployment & Verification', 'Security & Analysis'],
  'defender-deploy': ['Deployment & Verification', 'Security & Analysis'],
  'solidityStaticAnalysis': ['Core Tools', 'Security & Analysis'],
  'solidityscan': ['Security & Analysis'],
  
  // --- Deployment & Verification ---
  'buildbear': ['Deployment & Verification', 'Testing & Security'],
  'wds-code-remix': ['Deployment & Verification', 'Alternative Languages'],
  'contract_deployer': ['Deployment & Verification'],
  'coti-remix-plugin': ['Deployment & Verification'],
  'bif-udapp-js': ['Deployment & Verification', 'Alternative Languages'],
  'bif-udapp': ['Deployment & Verification'],
  'klaytn-remix-plugin': ['Deployment & Verification'],
  'tenderly': ['Deployment & Verification', 'Security & Analysis', 'Learning & Utilities'],
  
  // --- Core Tools & Alternative Languages ---
  'debugger': ['Core Tools', 'Security & Analysis'],
  'solidityUnitTesting': ['Core Tools', 'Security & Analysis'],
  'vyper': ['Core Tools', 'Alternative Languages'],
  'bif-solidity': ['Core Tools'],
  'remixd': ['Core Tools', 'Learning & Utilities'],

  // --- Learning & Utilities ---
  'cookbookdev': ['Learning & Utilities'],
  'desktopClient': ['Learning & Utilities'],
  'doc-gen': ['Learning & Utilities'],
  'LearnEth': ['Learning & Utilities'],
  'quick-dapp': ['Learning & Utilities', 'Deployment & Verification'],
  'remixGuide': ['Learning & Utilities'],
  'UIScriptRunner': ['Learning & Utilities'],
  'sentio-remix-plugin': ['Learning & Utilities'],
}

const allCategories = [
  'Core Tools', 
  'Deployment & Verification', 
  'Security & Analysis', 
  'Layer 2 & Scaling', 
  'ZK (Zero-Knowledge)', 
  'Alternative Languages', 
  'Learning & Utilities'
]

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  const [activeTab, setActiveTab] = useState('all')
  const [filterByRemix, setFilterByRemix] = useState<boolean>(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loadingPlugins, setLoadingPlugins] = useState<string[]>([])

  useEffect(() => {
    const onActivation = (profile: Profile) => {
      setLoadingPlugins(prev => prev.filter(p => p !== profile.name));
    }
    
    const client = pluginComponent as any;
    
    client.on('manager', 'activate', onActivation)
    client.on('manager', 'deactivate', onActivation)

    return () => {
      client.off('manager', 'activate', onActivation)
      client.off('manager', 'deactivate', onActivation)
    }
  }, [pluginComponent])

  const togglePlugin = async (pluginName: string) => {
    setLoadingPlugins(prev => [...prev, pluginName]);
    const isActive = pluginComponent.activePlugins.some(p => p.name === pluginName);
    try {
      if (isActive) {
        await pluginComponent.deactivateP(pluginName);
      } else {
        await pluginComponent.activateP(pluginName);
      }
    } catch (e) {
      console.error(e);
      setLoadingPlugins(prev => prev.filter(p => p !== pluginName));
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

  const getFilteredPlugins = () => {
    let plugins = [...pluginComponent.activePlugins, ...pluginComponent.inactivePlugins];

    if (filterByRemix) {
      plugins = plugins.filter(profile => profile.maintainedBy?.toLowerCase() === 'remix');
    }

    if (selectedCategories.length > 0) {
      plugins = plugins.filter(profile => {
        const categoriesOfPlugin = pluginCategories[profile.name] || [];
        return categoriesOfPlugin.some(cat => selectedCategories.includes(cat));
      });
    }
    return plugins;
  }

  const filteredPlugins = getFilteredPlugins();
  const activeCount = filteredPlugins.filter(p => pluginComponent.activePlugins.some(ap => ap.name === p.name)).length;
  const inactiveCount = filteredPlugins.filter(p => pluginComponent.inactivePlugins.some(ip => ip.name === p.name)).length;
  const allCount = filteredPlugins.length;

  const renderPluginList = () => {
    let pluginsToRender: Profile[] = [];
    switch (activeTab) {
      case 'active':
        pluginsToRender = filteredPlugins.filter(p => pluginComponent.activePlugins.some(ap => ap.name === p.name));
        break;
      case 'inactive':
        pluginsToRender = filteredPlugins.filter(p => pluginComponent.inactivePlugins.some(ip => ip.name === p.name));
        break;
      case 'all':
      default:
        pluginsToRender = filteredPlugins;
        break;
    }

    return pluginsToRender.map((profile, idx) => {
      const isActive = pluginComponent.activePlugins.some(p => p.name === profile.name)
      const isLoading = loadingPlugins.includes(profile.name)
      return <PluginCard profile={profile} isActive={isActive} togglePlugin={togglePlugin} key={profile.name || idx} isLoading={isLoading} />
    })
  }

  return (
    <RootView 
      pluginComponent={pluginComponent}
      filterByRemix={filterByRemix}
      setFilterByRemix={setFilterByRemix}
      categories={allCategories}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
    >
      <section data-id="pluginManagerComponentPluginManagerSection" className="px-3">
        <nav ref={tabsRef} className="plugin-manager-tabs mt-2 d-flex flex-row">
          <a data-id="pluginManagerAllTab" className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('all'); }}>
            <div className={activeTab === 'all' ? 'card-title' : ''}>
              All plugins <span className="badge" data-id="pluginManagerAllCount">{allCount}</span>
            </div>
          </a>
          <a data-id="pluginManagerActiveTab" className={`nav-link ${activeTab === 'active' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('active'); }}>
            <div className={activeTab === 'active' ? 'card-title' : ''}>
              Active <span className="badge" data-id="pluginManagerActiveCount">{activeCount}</span>
            </div>
          </a>
          <a data-id="pluginManagerInactiveTab" className={`nav-link ${activeTab === 'inactive' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('inactive'); }}>
            <div className={activeTab === 'inactive' ? 'card-title' : ''}>
              Inactive <span className="badge" data-id="pluginManagerInactiveCount">{inactiveCount}</span>
            </div>
          </a>
        </nav>
        <div className="plugin-list mt-3">{renderPluginList()}</div>
      </section>
    </RootView>
  )
}