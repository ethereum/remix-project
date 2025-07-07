/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { ThemeContext } from '../themeContext'
import fetchResults from '../fetch.json'
import { RenderIf } from '@remix-ui/helper'
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
  icon: string
  action: {
    type: 'link' | 'methodCall'
    label: string
    url?: string
    pluginName?: string
    pluginMethod?: string
  }
}

function HomeTabUpdates({ plugin }: HomeTabUpdatesProps) {
  const intl = useIntl()
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  function UpdateCard(updateInfo: UpdateInfo) {
    return (
      <div className="card mb-3">
        <div className="d-flex align-items-center p-3 overflow-hidden justify-content-between" style={{ height: '80px', backgroundColor: 'var(--body-bg)' }}>
          <span className="badge bg-info me-2 bg-transparent border p-2 rounded-pill text-ai" style={{ fontWeight: 'light', border: '1px solid var(--ai)' }}>{updateInfo.title}</span>
          <img src={'assets/img/in-app-marketing-card-illustration.svg'} alt="RemixAI Assistant" className="me-2" style={{ height: '150px', width: '150px' }} />
        </div>
        <div className="p-3" style={{ fontSize: '1rem', zIndex: 1 }}>
          <span className="d-block mt-1 mb-2" style={{ color: isDark ? 'white' : 'black' }}>{updateInfo.badge}</span>
          <div className="mb-2 small">{updateInfo.description}</div>
          <RenderIf condition={updateInfo.action.type === 'link'}>
            <a href={updateInfo.action.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-100 text-ai text-decoration-none">{updateInfo.action.label}</a>
          </RenderIf>
          <RenderIf condition={updateInfo.action.type === 'methodCall'}>
            <button className="btn btn-secondary btn-sm w-100 text-ai" onClick={() => plugin.call(updateInfo.action.pluginName, updateInfo.action.pluginMethod)}>{updateInfo.action.label}</button>
          </RenderIf>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end">
      <div className="row">
        {
          fetchResults.map((updateInfo: any) => (
            <div className="col-md-6">{ UpdateCard(updateInfo) }</div>
          ))}
      </div>
    </div>
  )
}

export default HomeTabUpdates
