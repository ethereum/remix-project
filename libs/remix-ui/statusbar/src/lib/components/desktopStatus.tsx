import React, { useEffect, Dispatch, useState, useContext } from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import '../../css/statusbar.css'
import { CustomTooltip } from '@remix-ui/helper'
import { AppContext } from '@remix-ui/app'

export interface DesktopStatusProps {
  plugin: StatusBar
}

export default function DesktopStatus({ plugin }: DesktopStatusProps) {
  const appContext = useContext(AppContext)

  useEffect(() => {
    //console.log('DesktopStatus', appContext.appState)
  }, [appContext.appState])

  return (
      <div
        className="d-flex flex-row pl-3 small text-white justify-content-center align-items-center"
      >
        {appContext.appState.connectedToDesktop === true ? 
        <>
        <span className="fas fa-plug mr-1"></span>
        <span className="">Desktop Connect Mode</span>
        </>
          :null}
      </div>
  )
}
