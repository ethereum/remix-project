import React from 'react'
import { PluginManagerProfile } from '../../types'

interface ModuleHeadingProps {
  headingLabel: string
  actives: Partial<PluginManagerProfile>[]
  inactives: Partial<PluginManagerProfile>[]
}

function ModuleHeading ({ headingLabel, actives, inactives }: ModuleHeadingProps) {
  return (
    <nav className="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
      <span className="navbar-brand plugins-list-title h6 mb-0 mr-2">{headingLabel}</span>
      <span className="badge badge-primary" style={{ cursor: 'default' }} data-id="pluginManagerComponentInactiveTilesCount">
        {headingLabel === 'Active Modules' ? actives.length : inactives.length}
      </span>
    </nav>
  )
}

export default ModuleHeading
