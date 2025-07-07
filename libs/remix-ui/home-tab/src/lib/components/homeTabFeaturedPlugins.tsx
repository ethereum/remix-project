/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { ThemeContext } from '../themeContext'
import { ToggleSwitch } from '@remix-ui/toggle'
import fetchResults from '../fetch2.json'
import { RenderIf } from '@remix-ui/helper'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabFeaturedPluginsProps {
  plugin: any
}

interface PluginInfo {
  pluginId: string
  pluginTitle: string
  action: {
    type: string
    label: string
    url?: string
    pluginName?: string
    pluginMethod?: string
  }
  iconClass: string
  maintainedByRemix: boolean
  description: string
}

function HomeTabFeaturedPlugins({ plugin }: HomeTabFeaturedPluginsProps) {
  const [activePlugins, setActivePlugins] = useState<string[]>([])
  const intl = useIntl()
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  const activateFeaturedPlugin = async (pluginId: string) => {
    if (await plugin.call('manager', 'isActive', pluginId)) {
      console.log('deactivate', pluginId)
      plugin.verticalIcons.select(pluginId)
      await plugin.call('manager', 'deactivatePlugin', pluginId)
      setActivePlugins(activePlugins.filter((pluginId) => pluginId !== pluginId))
    } else {
      console.log('activate', pluginId)
      await plugin.call('manager', 'activatePlugin', pluginId)
      plugin.verticalIcons.select(pluginId)
      setActivePlugins([...activePlugins, pluginId])
    }
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', pluginId])
  }

  function PluginCard(pluginInfo: PluginInfo) {
    return (
      <div className="card mb-3">
        <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
          <div className='d-flex align-items-center'>
            { pluginInfo.iconClass ? <i className={`${pluginInfo.iconClass} mr-2`}></i> : <i className="fa-solid fa-file-book mr-2"></i> }
            <span className="fw-bold" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.pluginTitle}</span>
          </div>
          <ToggleSwitch id={`toggleSwitch-${pluginInfo.pluginId}`} isOn={activePlugins.includes(pluginInfo.pluginId)} onClick={() => activateFeaturedPlugin(pluginInfo.pluginId)} />
        </div>
        <div className="p-2">
          <div className={`text-${pluginInfo.maintainedByRemix ? 'success' : 'dark'} mb-1`}><i className="fa-solid fa-shield-halved mr-2"></i>Maintained by {pluginInfo.maintainedByRemix ? 'Remix' : 'Community'}</div>
          <div className="small mb-2" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.description}</div>
          <RenderIf condition={pluginInfo.action.type === 'link'}>
            <a href={pluginInfo.action.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-100 text-decoration-none" onClick={() => plugin.call(pluginInfo.action.pluginName, pluginInfo.action.pluginMethod)}><i className="fa-solid fa-book mr-1"></i>{pluginInfo.action.label}</a>
          </RenderIf>
          <RenderIf condition={pluginInfo.action.type === 'methodCall'}>
            <button className="btn btn-secondary btn-sm w-100 text-decoration-none" onClick={() => plugin.call(pluginInfo.action.pluginName, pluginInfo.action.pluginMethod)}><i className="fa-solid fa-book mr-1"></i>{pluginInfo.action.label}</button>
          </RenderIf>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end remixui_featuredplugins_container" id="hTFeaturedPlugins">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 style={{ color: isDark ? 'white' : 'black' }}>{fetchResults.caption}</h6>
        <button className="btn btn-secondary btn-sm" onClick={() => plugin.call('menuicons', 'select', 'pluginManager')} >Explore all plugins</button>
      </div>
      <div className="row">
        {
          fetchResults.plugins.map((pluginInfo: PluginInfo) => (
            <div className="col-md-6" key={pluginInfo.pluginId}>{ PluginCard(pluginInfo) }</div>
          ))}
      </div>
    </div>
  )
}

export default HomeTabFeaturedPlugins
