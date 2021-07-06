import React, { useContext } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'
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

// eslint-disable-next-line no-empty-pattern
function PluginCard () {
  const { profile } = useContext(PluginManagerContext)
  return (
    <article className="list-group-item py-1 mb-1 plugins-list-group-item" title="PLuginCardTitle">
      <div className="row justify-content-between align-items-center mb-2">
        <h6 className="displayName plugin-name">
          <div>
            {profile.displayName}
            {profile.docLink}
            {profile.versionWarning}
          </div>
          <Button
            profileName="Sample Profile"
            isActive
          />
        </h6>
      </div>
      <div className="description d-flex text-body plugin-text mb-2">
        <img src="" className="mr-1 mt-1 pluginIcon" alt="profile icon"/>
        <span className="descriptiontext">{profile.description}</span>
      </div>
    </article>
  )
}

export default PluginCard
