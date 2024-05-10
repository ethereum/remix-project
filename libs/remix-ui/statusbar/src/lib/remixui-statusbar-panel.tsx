import React from 'react'
import { StatusBarInterface } from './types'
import GitStatus from './components/gitStatus'
import AIStatus from './components/aiStatus'

export interface RemixUIStatusBarProps {
  statusBarPlugin: StatusBarInterface
}

export function RemixUIStatusBar ({ statusBarPlugin }: RemixUIStatusBarProps) {

  const getGitBranchName = async () => {
    return new Promise((resolve, recject) => {
      return 0
    })
  }
  return (
    <div className="d-flex flex-row bg-primary justify-content-between align-items-center">
      <div className="remixui_statusbar">
        <GitStatus />
      </div>
      <div className="remixui_statusbar">

      </div>
      <div className="remixui_statusbar">
        <AIStatus />
      </div>
    </div>
  )
}
