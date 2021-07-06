import React from 'react'
import { TileLabel } from '../../customTypes'

interface ActiveTileProps {
  inactivesCount?: number
  activesCount?: number
  tileLabel?: TileLabel
}

function ActiveTile ({ inactivesCount, activesCount, tileLabel }: ActiveTileProps) {
  return (
    <nav className="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
      <span className="navbar-brand plugins-list-title h6 mb-0 mr-2">{tileLabel.label}</span>
      <span className="badge badge-primary" style={{ cursor: 'default' }} data-id="pluginManagerComponentInactiveTilesCount">
        {tileLabel.label === 'Active Module' ? activesCount : tileLabel.label === 'Inactive Modules' ? inactivesCount : '-' }
      </span>
    </nav>
  )
}

export default ActiveTile
