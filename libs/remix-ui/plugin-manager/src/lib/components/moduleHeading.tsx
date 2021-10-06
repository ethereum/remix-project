/* eslint-disable @typescript-eslint/no-unused-vars,no-use-before-define */
import React from 'react'

interface ModuleHeadingProps {
  headingLabel: string
  count: number
}

function ModuleHeading ({ headingLabel, count }: ModuleHeadingProps) {
  return (
    <nav className="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
      <span className="navbar-brand plugins-list-title h6 mb-0 mr-2">{headingLabel}</span>
      <span className="badge badge-primary" style={{ cursor: 'default' }} data-id="pluginManagerComponentInactiveTilesCount">
        {count}
      </span>
    </nav>
  )
}

export default ModuleHeading
