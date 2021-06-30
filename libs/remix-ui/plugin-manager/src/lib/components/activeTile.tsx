import React from 'react'

type tileLabel = {
  label: 'Active Module' | 'Inactive Modules'
}

interface ActiveTileProps {
  inactivesCount?: number
  activesCount?: number
  tileLabel?: tileLabel
}

function ActiveTile ({ inactivesCount, activesCount, tileLabel }: ActiveTileProps) {
  return (
    <nav className="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
      <span className="navbar-brand plugins-list-title h6 mb-0 mr-2">{tileLabel.label}</span>
      <span className="badge badge-primary" style={{ cursor: 'default' }} data-id="pluginManagerComponentInactiveTilesCount">
        {tileLabel.label === 'Active Module' ? activesCount : inactivesCount}
      </span>
    </nav>
  )
}

export default ActiveTile
