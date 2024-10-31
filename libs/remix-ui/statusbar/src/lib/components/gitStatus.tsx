import React, { useEffect, Dispatch, useState, useContext } from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import '../../css/statusbar.css'
import { CustomTooltip } from '@remix-ui/helper'
import { AppContext } from '@remix-ui/app'

export interface GitStatusProps {
  plugin: StatusBar
  gitBranchName: string
  setGitBranchName: Dispatch<React.SetStateAction<string>>
}

export default function GitStatus({ plugin, gitBranchName, setGitBranchName }: GitStatusProps) {
  const appContext = useContext(AppContext)

  const openDgit = async () => {
    plugin.verticalIcons.select('dgit')
  }

  const initializeNewGitRepo = async () => {
    await plugin.call('dgit', 'init')
    await plugin.call('matomo', 'track', ['trackEvent', 'statusBar', 'initNewRepo']);
  }

  if (!appContext.appState.canUseGit) return null

  return (
    <CustomTooltip
      tooltipText={`${appContext.appState.needsGitInit ? 'Initialize as git repo' : 'Current branch: ' + appContext.appState.currentBranch.name}`}
    >
      <div
        className="d-flex flex-row pl-3 small text-white justify-content-center align-items-center remixui_statusbar_gitstatus"
        onClick={async () => await openDgit()}
      >
        {!appContext.appState.needsGitInit ? <span className="fa-regular fa-code-branch ml-1"></span>
          : <span className=" ml-1" onClick={initializeNewGitRepo}>Initialize as git repo</span>}
        {!appContext.appState.needsGitInit && appContext.appState.currentBranch &&
          <span onClick={async () => await openDgit()} className="ml-1">{appContext.appState.currentBranch.name}</span>
        }
      </div>
    </CustomTooltip>
  )
}
