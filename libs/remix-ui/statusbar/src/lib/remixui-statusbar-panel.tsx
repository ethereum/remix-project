import React, { useEffect, useState } from 'react'
import { StatusBarInterface } from './types'
import GitStatus from './components/gitStatus'
import AIStatus from './components/aiStatus'
import ScamAlertStatus from './components/scamAlertStatus'
import ScamDetails from './components/scamDetails'
import { FloatingFocusManager, autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import axios from 'axios'
import { get } from 'lodash'

export interface RemixUIStatusBarProps {
  statusBarPlugin: StatusBarInterface
}

export type ScamAlert = {
  message: string
  url: string
}

type GetCurrentWorkspace =
  {
    name: string
    isLocalhost: boolean
    absolutePath: string
  }

export function RemixUIStatusBar({ statusBarPlugin }: RemixUIStatusBarProps) {
  const [showScamDetails, setShowScamDetails] = useState(false)
  const [scamAlerts, setScamAlerts] = useState<ScamAlert[]>([])
  const [workspaceName, setWorkspaceName] = useState('')
  const { refs, context, floatingStyles } = useFloating({
    open: showScamDetails,
    onOpenChange: setShowScamDetails,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: 'end' }), shift()],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    async function getScamAlerts() {
      const response = await axios.get('https://raw.githubusercontent.com/remix-project-org/remix-dynamics/main/ide/scam-alerts.json', { signal })
      if (signal.aborted) return
      setScamAlerts(response.data.alerts)
    }
    getScamAlerts()
    return () => {
      abortController.abort()
    }
  }, [])

  async function getGitBranchName() {
    const gitRepo = await statusBarPlugin.call('fileManager', 'isGitRepo')
    console.log('gitRepo', gitRepo)
    return gitRepo
  }
  async function getWorkspaceName() {
    console.log(statusBarPlugin)
    const workspaceObject = await statusBarPlugin.call('filePanel', 'getCurrentWorkspace')
    if (workspaceObject === null) {
      console.log('workspaceObject is null or undefined')
      return
    }
    console.log('workspaceObject', workspaceObject)
  }
  function getWorkspaceGitBranchName() {
    if (!getGitBranchName()) return
    getWorkspaceName()
  }
  // getWorkspaceName()
  getWorkspaceGitBranchName()

  return (
    <>
      {showScamDetails && (
        <FloatingFocusManager context={context} modal={false}>
          <ScamDetails refs={refs} floatStyle={{ ...floatingStyles, minHeight: '300px', alignContent: 'center', paddingRight: '5px' }} getFloatingProps={getFloatingProps} scamAlerts={scamAlerts} />
        </FloatingFocusManager>
      )}
      <div className="d-flex flex-row bg-primary justify-content-between align-items-center">
        <div className="remixui_statusbar">
          <GitStatus workspaceName={workspaceName ?? 'none'} />
        </div>
        <div className="remixui_statusbar"></div>
        <div className="remixui_statusbar d-flex flex-row">
          <ScamAlertStatus refs={refs} getReferenceProps={getReferenceProps} />
          <AIStatus />
        </div>
      </div>
    </>
  )
}
