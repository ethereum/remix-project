import React, { useEffect, Dispatch } from 'react'
import { StatusBarInterface } from '../types'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import '../../css/statusbar.css'

export interface GitStatusProps {
  plugin: StatusBar
  gitBranchName: string
  setGitBranchName: Dispatch<React.SetStateAction<string>>
}

export default function GitStatus({ plugin, gitBranchName, setGitBranchName }: GitStatusProps) {

  useEffect(() => {
    const run = async () => {
      plugin.on('filePanel', 'setWorkspace', async (workspace) => {
        const isGit = await plugin.call('fileManager', 'isGitRepo')
        if (isGit) {
          console.log(plugin.isGitRepo)
          setGitBranchName(workspace.name)
        } else {
          setGitBranchName('Not a git repo')
        }
        console.log('setWorkspace on workspaceswitch',workspace)
      })
    }
    run()
  }, [gitBranchName, plugin.isGitRepo])

  useEffect(() => {
    const run = async () => {
      plugin.on('filePanel', 'workspaceInitializationCompleted', async () => {
        const isGit = await plugin.call('fileManager', 'isGitRepo')
        if (isGit) {
          console.log(plugin.isGitRepo)
          const workspace = localStorage.getItem('currentWorkspace')
          setGitBranchName(workspace)
        } else {
          setGitBranchName('Not a git repo')
        }
        console.log('setWorkspace on workspaceswitch')
      })
    }
    run()
  }, [gitBranchName, plugin.isGitRepo])

  const lightDgitUp = async () => {
    const isActive = await plugin.call('manager', 'isActive', 'dgit')
    const isGit = await plugin.call('fileManager', 'isGitRepo')
    if (!isActive) await plugin.call('manager', 'activatePlugin', 'dgit')
    if (gitBranchName.length > 0 && isGit) {
      plugin.verticalIcons.select('dgit')
    }
  }

  return (
    <div
      className="d-flex flex-row p-1 text-white justify-content-center align-items-center remixui_statusbar_gitstatus"
      onClick={async () => await lightDgitUp()}
    >
      {gitBranchName.length > 0 && gitBranchName !== 'Not a git repo' && <span className="fa-regular fa-code-branch ml-1"></span>}
      <span className="small mx-1">{`${gitBranchName}`}</span>
      {gitBranchName.length > 0 && gitBranchName !== 'Not a git repo' && <span className="fa-solid fa-arrows-rotate fa-1"></span>}
    </div>
  )
}
