/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../themeContext'
import { ToggleSwitch } from '@remix-ui/toggle'
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
import { HOME_TAB_PLUGIN_LIST } from './constant'
import axios from 'axios'
import { LoadingCard } from './LoaderPlaceholder'
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
    pluginArgs?: (string | number | boolean | object | null)[]
  }
  iconClass: string
  maintainedByRemix: boolean
  description: string
}

function HomeTabFeaturedPlugins({ plugin }: HomeTabFeaturedPluginsProps) {
  const [activePlugins, setActivePlugins] = useState<string[]>([])
  const [loadingPlugins, setLoadingPlugins] = useState<string[]>([])
  const [pluginList, setPluginList] = useState<{ caption: string, plugins: PluginInfo[] }>({ caption: '', plugins: []})
  const [isLoading, setIsLoading] = useState(true)
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  useEffect(() => {
    async function getPluginList() {
      try {
        setIsLoading(true)
        const response = await axios.get(HOME_TAB_PLUGIN_LIST)

        response.data && setPluginList(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching plugin list:', error)
      }
    }
    getPluginList()

    plugin.on('manager', 'activate', (plugin: { name: string }) => {
      setActivePlugins(activePlugins => [...activePlugins, plugin.name])
    })
  }, [])

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
      <div className="card border">
        <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
          <div className='d-flex align-items-center px-2'>
            <RenderIf condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              <i className="fad fa-spinner fa-spin"></i>
            </RenderIf>
            <RenderIfNot condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              { pluginInfo.iconClass ? <i className={`${pluginInfo.iconClass} mr-2`}></i> : <i className="fa-solid fa-file-book mr-2"></i> }
            </RenderIfNot>
            <span className="fw-bold" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.pluginTitle}</span>
          </div>
          <ToggleSwitch id={`toggleSwitch-${pluginInfo.pluginId}`} isOn={activePlugins.includes(pluginInfo.pluginId)} onClick={() => activateFeaturedPlugin(pluginInfo.pluginId)} />
        </div>
        <div className="p-3">
          <div className={`text-${pluginInfo.maintainedByRemix ? 'success' : 'dark'} mb-1`}><i className="fa-solid fa-shield-halved mr-2"></i>Maintained by {pluginInfo.maintainedByRemix ? 'Remix' : 'Community'}</div>
          <div className="small mb-2" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.description}</div>
          <RenderIf condition={pluginInfo.action.type === 'link'}>
            <a href={pluginInfo.action.url} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm w-100 text-decoration-none border" onClick={() => plugin.call(pluginInfo.action.pluginName, pluginInfo.action.pluginMethod)}><i className="fa-solid fa-book mr-1"></i>{pluginInfo.action.label}</a>
          </RenderIf>
          <RenderIf condition={pluginInfo.action.type === 'methodCall'}>
            <button className="btn btn-light btn-sm w-100 text-decoration-none border" onClick={() => plugin.call(pluginInfo.action.pluginName, pluginInfo.action.pluginMethod, pluginInfo.action.pluginArgs)}>
              <i className="fa-solid fa-book mr-1"></i>{pluginInfo.action.label}
            </button>
          </RenderIf>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end remixui_featuredplugins_container" id="hTFeaturedPlugins">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 style={{ color: isDark ? 'white' : 'black' }}>{pluginList.caption}</h6>
        <button className="btn btn-secondary btn-sm" onClick={() => plugin.call('menuicons', 'select', 'pluginManager')} >Explore all plugins</button>
      </div>
      <div className="row">
        {
          isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-${index}`} className="col-md-6 mb-4">
                <LoadingCard />
              </div>
            ))
          ) : (
            pluginList.plugins.map((pluginInfo: PluginInfo) => (
              <div className="col-md-6 mb-4 " key={pluginInfo.pluginId}>{ PluginCard(pluginInfo) }</div>
            ))
          )
        }
      </div>
    </div>
  )
}

export default HomeTabFeaturedPlugins
