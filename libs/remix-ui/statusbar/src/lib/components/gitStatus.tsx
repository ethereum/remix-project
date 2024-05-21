import React, { useEffect, useState } from 'react'
import { StatusBarInterface } from '../types'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import '../../css/statusbar.css'

export interface GitStatusProps {
  plugin: StatusBar
}

export default function GitStatus({ plugin }: GitStatusProps) {

  const [gitBranchName, setGitBranchName] = useState('')

  useEffect(() => {
    plugin.on('filePanel', 'workspaceInitializationCompleted', async () => {
      const isGit = await plugin.call('fileManager', 'isGitRepo')
      console.log('git', isGit)
      if (!isGit) return
      const workspaceName = localStorage.getItem('currentWorkspace')
      workspaceName && workspaceName.length > 0 ? setGitBranchName(workspaceName) : setGitBranchName('')
    })
    // console.log('testing', plugin)
  }, [])

  const lightDgitUp = async () => {
    const isActive = await plugin.call('manager', 'isActive', 'dgit')
    if (!isActive) await plugin.call('manager', 'activatePlugin', 'dgit')
    plugin.verticalIcons.select('dgit')
  }

  return (
    <div
      className="d-flex flex-row p-1 text-white justify-content-center align-items-center remixui_statusbar_gitstatus"
      onClick={async () => await lightDgitUp()}
    >
      <span className="fa-regular fa-code-branch ml-1"></span>
      <span className="small mx-1">{`${gitBranchName}`}</span>
      <span className="fa-solid fa-arrows-rotate fa-1"></span>
    </div>
  )
}
