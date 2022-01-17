import React, { useEffect, useRef, useState } from 'react'
import './style/remix-app.css'
import { RemixUIMainPanel } from '@remix-ui/panel'
import RemixSplashScreen from './components/splashscreen'
import MatomoDialog from './components/modals/matomo'
import OriginWarning from './components/modals/origin-warning'
import DragBar from './components/dragbar/dragbar'
import { AppProvider } from './context/provider'
import AppDialogs from './components/modals/dialogs'
import DialogViewPlugin from './components/modals/dialogViewPlugin'

interface IRemixAppUi {
  app: any
}

const RemixApp = (props: IRemixAppUi) => {
  const [appReady, setAppReady] = useState<boolean>(false)
  const [loading, hideLoader] = useState<boolean>(false)
  const [init, setInit] = useState<boolean>(false)
  const [hideSidePanel, setHideSidePanel] = useState<boolean>(false)
  const sidePanelRef = useRef(null)
  const mainPanelRef = useRef(null)
  const iconPanelRef = useRef(null)
  const hiddenPanelRef = useRef(null)
  const panelsRendered = useRef(false)

  useEffect(() => {
    async function run () {
      await props.app.run()
      setInit(true)
    }
    run()
  }, [])

  useEffect(() => {
    if (!init) return

    async function activateApp () {
      props.app.themeModule.initTheme(() => {
        setAppReady(true)
        props.app.activate()
        setListeners()
      })
    }
    if (props.app) {
      activateApp()
    }
  }, [init])

  useEffect(() => {
    if (!panelsRendered.current) {
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
        panelsRendered.current = true
      }
    }
  })

  function setListeners () {
    props.app.layout.event.on('startrender', () => {
      hideLoader(true)
    })
    props.app.sidePanel.events.on('toggle', () => {
      setHideSidePanel(prev => {
        return !prev
      })
    })
    props.app.sidePanel.events.on('showing', () => {
      setHideSidePanel(false)
    })

    props.app.layout.event.on('minimizesidepanel', () => {
      // the 'showing' event always fires from sidepanel, so delay this a bit
      setTimeout(() => {
        setHideSidePanel(true)
      }, 1000)
    })
  }

  const components = {
    iconPanel: <div ref={iconPanelRef} id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light"></div>,
    sidePanel: <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className={`sidepanel border-right border-left ${hideSidePanel ? 'd-none' : ''}`}></div>,
    mainPanel: <div ref={mainPanelRef} id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'></div>,
    hiddenPanel: <div ref={hiddenPanelRef}></div>
  }

  const value = {
    settings: props.app.settings,
    showMatamo: props.app.showMatamo,
    appManager: props.app.appManager,
    modal: props.app.modal,
    layout: props.app.layout
  }

  return (
    <AppProvider value={value}>
      {appReady
        ? <>
          <OriginWarning></OriginWarning>
          <div className={`remixIDE ${appReady ? '' : 'd-none'}`} data-id="remixIDE">
            {components.iconPanel}
            {components.sidePanel}
            <DragBar minWidth={250} refObject={sidePanelRef} hidden={hideSidePanel} setHideStatus={setHideSidePanel}></DragBar>
            <div id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'>
              <RemixUIMainPanel></RemixUIMainPanel>
            </div>
          </div>
          {components.hiddenPanel}
          <AppDialogs></AppDialogs>
          <DialogViewPlugin></DialogViewPlugin>
          {loading ? <MatomoDialog></MatomoDialog> : null}
        </>
        : null}
      <RemixSplashScreen hide={loading}></RemixSplashScreen>
    </AppProvider>
  )
}

export default RemixApp
