/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../themeContext'
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
import axios from 'axios'
import { HOME_TAB_BASE_URL, HOME_TAB_NEW_UPDATES } from './constant'
import { LoadingCard } from './LoaderPlaceholder'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabUpdatesProps {
  plugin: any
}

interface UpdateInfo {
  badge: string
  title: string
  description: string
  descriptionList?: string[]
  icon: string
  action: {
    type: 'link' | 'methodCall'
    label: string
    url?: string
    pluginName?: string
    pluginMethod?: string,
    pluginArgs?: (string | number | boolean | object | null)[]
  },
  theme: string
}

function HomeTabUpdates({ plugin }: HomeTabUpdatesProps) {
  const [pluginList, setPluginList] = useState<UpdateInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  useEffect(() => {
    async function getLatestUpdates() {
      try {
        setIsLoading(true)
        const response = await axios.get(HOME_TAB_NEW_UPDATES)
        setPluginList(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching plugin list:', error)
      }
    }
    getLatestUpdates()
  }, [])

  function UpdateCard(updateInfo: UpdateInfo) {
    return (
      <div className="card border h-100 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center p-3 overflow-hidden justify-content-between" style={{ height: '80px', backgroundColor: 'var(--body-bg)' }}>
            <span className={`badge bg-info bg-transparent border p-2 rounded-pill text-${updateInfo.theme}`} style={{ fontWeight: 'light', border: `1px solid var(--${updateInfo.theme})` }}>{updateInfo.badge}</span>
            <img src={`${HOME_TAB_BASE_URL + updateInfo.icon}`} alt="RemixAI Assistant" style={{ height: '150px', width: '150px' }} />
          </div>
          <div className="px-3" style={{ fontSize: '1rem', zIndex: 1 }}>
            <span className="d-block my-2" style={{ color: isDark ? 'white' : 'black' }}>
              {updateInfo.title}
            </span>
            {Array.isArray(updateInfo.descriptionList) && updateInfo.descriptionList.length > 0 ? (
              <div className="mb-3 small">
                <ul className="list-unstyled">
                  {updateInfo.descriptionList.map((description: string, index: number) => (
                    <li key={`description-${index}`} className='mb-1'><i className="far fa-check-circle mr-2"></i>{description}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-3 small">{updateInfo.description}</div>
            )}
          </div>
        </div>
        <div className="px-3 pb-3">
          <RenderIf condition={updateInfo.action.type === 'link'}>
            <a href={updateInfo.action.url} target="_blank" rel="noopener noreferrer" className={`btn btn-light btn-sm w-100 text-decoration-none border ${updateInfo.theme !== 'primary' && `text-${updateInfo.theme}`}`}>{updateInfo.action.label}</a>
          </RenderIf>
          <RenderIf condition={updateInfo.action.type === 'methodCall'}>
            <button className={`btn btn-light btn-sm w-100 border ${updateInfo.theme !== 'primary' && `text-${updateInfo.theme}`}`} onClick={() => plugin.call(updateInfo.action.pluginName, updateInfo.action.pluginMethod, updateInfo.action.pluginArgs)}>
              {updateInfo.action.label}
            </button>
          </RenderIf>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end">
      <div className="row">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4">
              <LoadingCard />
            </div>
          ))
        ) : (
          pluginList.map((updateInfo: UpdateInfo, index: number) => (
            <div key={`update-${index}`} className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4">
              {UpdateCard(updateInfo)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HomeTabUpdates
