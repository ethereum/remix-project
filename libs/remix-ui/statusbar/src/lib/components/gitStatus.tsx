import React, { useEffect, Dispatch, useState } from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import '../../css/statusbar.css'
import { CustomTooltip } from '@remix-ui/helper'

export interface GitStatusProps {
  plugin: StatusBar
  gitBranchName: string
  setGitBranchName: Dispatch<React.SetStateAction<string>>
}

export default function GitStatus({ plugin, gitBranchName, setGitBranchName }: GitStatusProps) {
  const [isLocalHost, setIsLocalHost] = useState(false)

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', async (workspace) => {
      const isGit = await plugin.call('fileManager', 'isGitRepo')
      setIsLocalHost(workspace.isLocalhost)
      if (isGit) {
        setGitBranchName(workspace.name)
      } else {
        setGitBranchName('Not a git repo')
      }
    })
    plugin.on('filePanel', 'workspaceInitializationCompleted', async () => {
      const isGit = await plugin.call('fileManager', 'isGitRepo')
      if (isGit) {
        const workspace = localStorage.getItem('currentWorkspace')
        setGitBranchName(workspace)
      } else {
        setGitBranchName('Not a git repo')
      }
    })
    plugin.on('dgitApi', 'init', async () => {
      const isGit = await plugin.call('fileManager', 'isGitRepo')
      if (isGit) {
        const workspace = localStorage.getItem('currentWorkspace')
        setGitBranchName(workspace)
      }
    })

  }, [])

  const lightDgitUp = async () => {
    const isActive = await plugin.call('manager', 'isActive', 'dgit')
    const isGit = await plugin.call('fileManager', 'isGitRepo')
    if (!isActive) await plugin.call('manager', 'activatePlugin', 'dgit')
    if (gitBranchName.length > 0 && isGit) {
      plugin.verticalIcons.select('dgit')
    }
  }

  const initializeNewGitRepo = async () => {
    if (isLocalHost === false) {
      const isActive = await plugin.call('manager', 'isActive', 'dgit')
      if (!isActive) await plugin.call('manager', 'activatePlugin', 'dgit')
      await plugin.call('dgitApi', 'init')
      ;(window as any)._paq.push('trackEvent', 'statusbar', 'initNewRepo')
    }
  }

  const checkBranchName = ()=> {
    return gitBranchName && gitBranchName !== 'Not a git repo' && gitBranchName.length > 0
  }
  return (
    <CustomTooltip
      tooltipText={`${gitBranchName === 'Not a git repo' ? 'Initialize as a git repo' : gitBranchName} (Git)`}
    >
      <div
        className="d-flex flex-row pl-3 small text-white justify-content-center align-items-center remixui_statusbar_gitstatus"
        onClick={async () => await lightDgitUp()}
      >
        {checkBranchName() && isLocalHost === false ? <span className="fa-regular fa-code-branch ml-1"></span>
          : <span className=" ml-1" onClick={initializeNewGitRepo}> Initialize as git repo</span>}
        {checkBranchName() && isLocalHost === false && <span className="ml-1">{gitBranchName}</span>}
        {checkBranchName() && isLocalHost === false && <span className="fa-solid fa-arrows-rotate fa-1 ml-1"></span>}
      </div>
    </CustomTooltip>
  )
}
