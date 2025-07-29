/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState } from 'react' // eslint-disable-line no-use-before-define
import { RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import PluginCard from './components/PluginCard'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  // 'all', 'active', 'inactive' 중 현재 선택된 탭을 관리
  const [activeTab, setActiveTab] = useState('all')
  const [filterByRemix, setFilterByRemix] = useState<boolean>(false)

  // 토글 스위치를 클릭했을 때 호출될 함수
  const togglePlugin = (pluginName: string) => {
    const isActive = pluginComponent.activePlugins.some(p => p.name === pluginName)
    if (isActive) {
      pluginComponent.deactivateP(pluginName)
    } else {
      pluginComponent.activateP(pluginName)
    }
  }

  // 현재 탭에 따라 렌더링할 플러그인 목록을 결정하는 함수
  const renderPluginList = () => {
    let pluginsToRender: Profile[] = [] // 타입을 명확히 해줍니다.
    switch (activeTab) {
      case 'active':
        pluginsToRender = pluginComponent.activePlugins
        break
      case 'inactive':
        pluginsToRender = pluginComponent.inactivePlugins
        break
      case 'all':
      default:
        // allPlugins를 직접 참조하는 대신 두 배열을 합칩니다.
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
        {/* 4. 탭 UI 구조 및 클래스 수정 */}
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