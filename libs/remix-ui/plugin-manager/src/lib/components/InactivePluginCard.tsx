/* eslint-disable no-debugger */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState } from 'react'
import '../remix-ui-plugin-manager.css'
interface PluginCardProps {
  profile: Profile & {
    icon?: string
  }
  buttonText: string
  activatePlugin: (plugin: Profile) => void
  // inactivePlugins: Profile[]
  // setInactivePlugins: Dispatch<React.SetStateAction<Profile<any>[]>>
  // setActivePlugins: Dispatch<React.SetStateAction<Profile<any>[]>>
  // activePlugins: Profile[]
  // pluginComponent: PluginManagerComponent
}

// eslint-disable-next-line no-empty-pattern
function InactivePluginCard ({
  profile,
  buttonText,
  activatePlugin
}: PluginCardProps) {
  const [displayName] = useState<string>((profile.displayName) ? profile.displayName : profile.name)
  const [docLink] = useState<JSX.Element>((profile.documentation) ? (
    <a href={profile.documentation} className="px-1" title="link to documentation" target="_blank" rel="noreferrer">
      <i aria-hidden="true" className="fas fa-book"/>
    </a>
  ) : null)

  const [versionWarning] = useState<JSX.Element>((profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) ? (
    <small title="Version Alpha" className="remixui_versionWarning plugin-version">alpha</small>
  ) : (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) ? (
    <small title="Version Beta" className="remixui_versionWarning plugin-version">beta</small>
  ) : null)

  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      <article className="list-group-item py-1 mb-1 plugins-list-group-item" title={displayName}>
        <div className="remixui_row justify-content-between align-items-center mb-2">
          <h6 className="remixui_displayName plugin-name">
            <div>
              {displayName}
              {docLink}
              {versionWarning}
            </div>
            {
              <button
                onClick={() => {
                  activatePlugin(profile)
                  const newActives: Profile[] = JSON.parse(localStorage.getItem('newActivePlugins'))
                  if (!newActives.includes(profile)) {
                    newActives.push(profile)
                    localStorage.setItem('newActivePlugins', JSON.stringify(newActives))
                  }
                }}
                className="btn btn-success btn-sm"
                data-id={`pluginManagerComponentActivateButton${profile.name}`}
              >
                {buttonText}
              </button>
            }
          </h6>
        </div>
        <div className="remixui_description d-flex text-body plugin-text mb-2">
          { profile.icon ? <img src={profile.icon} className="mr-1 mt-1 remixui_pluginIcon" alt="profile icon"/> : null }
          <span className="remixui_descriptiontext">{profile.description}</span>
        </div>
      </article>
    </div>
  )
}

export default InactivePluginCard
