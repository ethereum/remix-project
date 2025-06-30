import React, { useContext } from 'react'
import '../../css/statusbar.css'
import { CustomTooltip } from '@remix-ui/helper'
import { AppContext } from '@remix-ui/app'
import { desktopConnectionType } from '@remix-api'

export const DesktopStatus = () => {
  const appContext = useContext(AppContext)

  return (
    <div className={`d-flex flex-row pl-3 small text-white justify-content-center align-items-center 
    
      ${appContext.appState.connectedToDesktop === desktopConnectionType.connected ? 'bg-success' : ''}
      ${appContext.appState.connectedToDesktop === desktopConnectionType.alreadyConnected ? 'bg-danger' : ''}
      ${appContext.appState.connectedToDesktop === desktopConnectionType.disconnected ? 'bg-warning' : ''}
      
     w-100 h-100`}>
      {appContext.appState.connectedToDesktop === desktopConnectionType.connected ? (
        <>
          <span className="fas fa-plug mr-1"></span>
          <span className="">Connected to the desktop application</span>
        </>
      ) : null}
      {appContext.appState.desktopClientConnected === desktopConnectionType.connected ? (
        <>
          <span className="text-success">
            <span className="fas fa-plug mr-1"></span>
            <span className="">Connected to browser</span>
          </span>
        </>
      ) : null}
      {appContext.appState.desktopClientConnected === desktopConnectionType.connectedToInjected ? (
        <>
          <span className="text-success">
            <span className="fas fa-plug mr-1"></span>
            <span className="">Connected to Metamask</span>
          </span>
        </>
      ) : null}
      {appContext.appState.connectedToDesktop === desktopConnectionType.alreadyConnected ? (
        <>
          <span><i className="fas fa-warning mr-1"></i>Error: you are already connected to the desktop application in another tab or window</span>
        </>
      ) : null}
      {appContext.appState.connectedToDesktop === desktopConnectionType.disconnected ? (
        <>
          <span className="fas fa-plug mr-1"></span>
          <span className="">Waiting for the desktop application to connect...</span>
        </>
      ) : null}
    </div>
  )
}
