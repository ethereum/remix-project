import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ToggleSwitch } from '@remix-ui/toggle'
import { RenderIf } from '@remix-ui/helper'

interface PluginCardProps {
  profile: any
  isActive: boolean
  isLoading: boolean
  togglePlugin: (pluginName: string) => void
}

function PluginCard({ profile, isActive, isLoading, togglePlugin }: PluginCardProps) {
  const handleDocsClick = () => {
    if (profile.documentation) {
      window.open(profile.documentation, '_blank')
    }
  }

  return (
    <article className="remixui-plugin-card card h-100" data-id={`plugin-manager-plugin-card-${profile.name}`}>
      <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
        <div className='d-flex align-items-center px-2'>
          <RenderIf condition={isLoading}>
            <i className="fad fa-spinner fa-spin mr-2"></i>
          </RenderIf>
          <RenderIf condition={!isLoading}>
            {profile.icon ? <img src={profile.icon} className="mr-2 remixui_pluginIcon" alt={`${profile.name} icon`} /> : <i className="fas fa-puzzle-piece mr-2"></i>}
          </RenderIf>
          <span className={`font-weight-bold ${isActive ? 'card-title' : ''}`}>{profile.displayName || profile.name}</span>
        </div>
        <ToggleSwitch id={`toggleSwitch-${profile.name}`} isOn={isActive} onClick={() => togglePlugin(profile.name)} />
      </div>
      
      <div className="d-flex flex-column justify-content-between h-100">
        <div className="p-3">
          <div className={`text-${(profile.maintainedBy || '').toLowerCase() === 'remix' ? 'success' : 'dark'} mb-1`}>
            <i className="fa-solid fa-shield-halved mr-2"></i>
            <FormattedMessage id="home.maintainedBy" defaultMessage="Maintained by"/> {profile.maintainedBy || 'Community'}
          </div>
          <div className="small mb-2">{profile.description}</div>
        </div>
        {profile.documentation && (
          <div className="px-3 pb-3">
            <button className="btn btn-light btn-sm w-100 text-decoration-none border" onClick={handleDocsClick}>
              <i className="fa-solid fa-book mr-1"></i>
              <FormattedMessage id="pluginManager.openDocumentation" defaultMessage="Open documentation" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default PluginCard