import React, { useContext, useEffect, useRef, useState } from 'react'
import './style/remix-app.css'
import RemixSplashScreen from './modals/splashscreen'
import MatomoDialog from './modals/matomo'
import AlertModal from './modals/alert'
import AppContext from './context/context'
interface IRemixAppUi {
  app: any
}

const RemixApp = (props: IRemixAppUi) => {
  const [appReady, setAppReady] = useState<boolean>(false)
  const sidePanelRef = useRef(null)
  const mainPanelRef = useRef(null)
  const iconPanelRef = useRef(null)
  const hiddenPanelRef = useRef(null)

  useEffect(() => {
    console.log('mounting app')
    if (sidePanelRef.current) {
      if (props.app.sidePanel) {
        sidePanelRef.current.appendChild(props.app.sidePanel.render())
      }
    }
    if (mainPanelRef.current) {
      if (props.app.mainview) {
        mainPanelRef.current.appendChild(props.app.mainview.render())
      }
    }
    if (iconPanelRef.current) {
      if (props.app.menuicons) {
        iconPanelRef.current.appendChild(props.app.menuicons.render())
      }
    }
    if (hiddenPanelRef.current) {
      if (props.app.hiddenPanel) {
        hiddenPanelRef.current.appendChild(props.app.hiddenPanel.render())
      }
    }
    async function activateApp () {
      props.app.themeModule.initTheme(() => {
        setAppReady(true)
        props.app.activate()
      })
    }
    if (props.app) {
      console.log('app', props.app)
      activateApp()
    }
  }, [])

  const components = {
    iconPanel: <div ref={iconPanelRef} id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light"></div>,
    sidePanel: <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className="sidepanel border-right border-left"></div>,
    mainPanel: <div ref={mainPanelRef} id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'></div>,
    hiddenPanel: <div ref={hiddenPanelRef}></div>
  }

  return (
    <AppContext.Provider value={{ settings: props.app.settings, showMatamo: props.app.showMatamo, appManager: props.app.appManager }}>
      <RemixSplashScreen hide={appReady}></RemixSplashScreen>
      <AlertModal></AlertModal>
      <MatomoDialog hide={!appReady}></MatomoDialog>

      <div className={`remixIDE ${appReady ? '' : 'd-none'}`} data-id="remixIDE">
        {components.iconPanel}
        {components.sidePanel}
        {components.mainPanel}
      </div>
      {components.hiddenPanel}
    </AppContext.Provider>

  )
}

export default RemixApp
