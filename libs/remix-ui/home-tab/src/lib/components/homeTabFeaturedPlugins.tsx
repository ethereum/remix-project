/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ThemeContext } from '../themeContext'
import { ToggleSwitch } from '@remix-ui/toggle'
import fetchResults from '../fetch2.json'
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
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
  const [loadingPlugins, setLoadingPlugins] = useState<string[]>([])
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  // TODO: Fix this
  // useEffect(() => {
  //   const fetchActivePlugins = async () => {
  //     fetchResults.plugins.forEach(async (pluginInfo: PluginInfo) => {
  //       const isActive = await plugin.appManager.isActive(pluginInfo.pluginId)
  //       if (isActive) {
  //         setActivePlugins([...activePlugins, pluginInfo.pluginId])
  //       }
  //     })
  //   }
  //   fetchActivePlugins()
  // }, [])

  const activateFeaturedPlugin = async (pluginId: string) => {
    setLoadingPlugins([...loadingPlugins, pluginId])
    if (await plugin.appManager.isActive(pluginId)) {
      await plugin.appManager.deactivatePlugin(pluginId)
      setActivePlugins(activePlugins.filter((id) => id !== pluginId))
    } else {
      await plugin.appManager.activatePlugin([pluginId])
      await plugin.verticalIcons.select(pluginId)
      setActivePlugins([...activePlugins, pluginId])
    }
    setLoadingPlugins(loadingPlugins.filter((id) => id !== pluginId))
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', pluginId])
  }

  function PluginCard(pluginInfo: PluginInfo) {
    return (
      <div className="card mb-3">
        <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
          <div className='d-flex align-items-center'>
            <RenderIf condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              <i className="fad fa-spinner fa-spin mr-2"></i>
            </RenderIf>
            <RenderIfNot condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              { pluginInfo.iconClass ? <i className={`${pluginInfo.iconClass} mr-2`}></i> : <i className="fa-solid fa-file-book mr-2"></i> }
            </RenderIfNot>
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
