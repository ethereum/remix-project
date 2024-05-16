import React, { useState } from 'react'
import { StatusBarInterface } from './types'
import GitStatus from './components/gitStatus'
import AIStatus from './components/aiStatus'
import ScamAlertStatus from './components/scamAlertStatus'
import ScamDetails from './components/scamDetails'
import { FloatingFocusManager, autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'

export interface RemixUIStatusBarProps {
  statusBarPlugin: StatusBarInterface
}

export function RemixUIStatusBar ({ statusBarPlugin }: RemixUIStatusBarProps) {
  const [showScamDetails, setShowScamDetails] = useState(false)
  const { refs, context, floatingStyles } = useFloating({
    open: showScamDetails,
    onOpenChange: setShowScamDetails,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "end" }),
      shift()
    ],
    whileElementsMounted: autoUpdate
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ])
  const getGitBranchName = async () => {
    return new Promise((resolve, recject) => {
      return 0
    })
  }
  return (
    <>
      {showScamDetails && (
        <FloatingFocusManager context={context} modal={false}>
          <ScamDetails refs={refs} floatStyle={{ ...floatingStyles, minHeight: '300px', alignContent: 'center', paddingRight: '5px' }} getFloatingProps={getFloatingProps} />
        </FloatingFocusManager>)}
      <div className="d-flex flex-row bg-primary justify-content-between align-items-center">
        <div className="remixui_statusbar">
          <GitStatus />
        </div>
        <div className="remixui_statusbar">

        </div>
        <div className="remixui_statusbar d-flex flex-row">
          <ScamAlertStatus refs={refs} getReferenceProps={getReferenceProps} />
          <AIStatus />
        </div>
      </div>
    </>
  )
}
