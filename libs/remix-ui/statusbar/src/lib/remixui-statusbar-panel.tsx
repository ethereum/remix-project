import React from 'react'
import { StatusBarInterface } from './types'
import GitStatus from './components/gitStatus'

export interface RemixUIStatusBarProps {
  statusBarPlugin: StatusBarInterface
}

export function RemixUIStatusBar ({ statusBarPlugin }: RemixUIStatusBarProps) {
  return (
    <div className="d-flex flex-row bg-primary">
      <GitStatus />
    </div>
  )
}
