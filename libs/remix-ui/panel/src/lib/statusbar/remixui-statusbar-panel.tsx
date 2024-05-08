import React from 'react'
import { StatusBarInterface } from '../types'

export interface RemixUIStatusBarProps {
  statusBarPlugin: StatusBarInterface
}

export default function RemixUIStatusBar({ statusBarPlugin }: RemixUIStatusBarProps) {
  return (
    <div className="d-flex flex-row bg-primary">
      <h6>Statusbar</h6>
    </div>
  )
}
