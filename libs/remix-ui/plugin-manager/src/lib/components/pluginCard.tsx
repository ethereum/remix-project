import React from 'react'
import '../remix-ui-plugin-manager.css'
import Button from './button'
interface PluginCardProps {
  profileName: string
  displayName: string
  docLink: string
  versionWarning: any
  profileIcon: string
  profileDescription: string
}

function PluginCard ({
  profileName,
  displayName,
  docLink,
  versionWarning,
  profileIcon,
  profileDescription
}: PluginCardProps) {
  return (
    <article className="list-group-item py-1 mb-1 plugins-list-group-item" title={displayName}>
      <div className="row justify-content-between align-items-center mb-2">
        <h6 className="displayName plugin-name">
          <div>
            {displayName}
            {docLink}
            {versionWarning}
          </div>
          <Button
            profileName={profileName}
            isActive
          />
        </h6>
      </div>
      <div className="description d-flex text-body plugin-text mb-2">
        <img src={profileIcon} className="mr-1 mt-1 pluginIcon" alt="profile icon"/>
        <span className="descriptiontext">{profileDescription}</span>
      </div>
    </article>
  )
}

export default PluginCard
