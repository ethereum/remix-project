import React, { useContext, useEffect, useRef, useState } from 'react'
import './style/remix-app.css'
import './style/reflect/styles.css'
import RemixSplashScreen from './modals/splashscreen'
import MatomoDialog from './modals/matomo'
import AlertModal from './modals/alert'
import AppContext from './context/context'
import Draggable from 'react-draggable'
interface IRemixAppUi {
  app: any
}

const RemixApp = (props: IRemixAppUi) => {
  const [appReady, setAppReady] = useState<boolean>(false)
  const [dragState, setDragState] = useState<boolean>(false)
  const [hideSidePanel, setHideSidePanel] = useState<boolean>(false)
  const [dragBarPos, setDragBarPos] = useState<number>(0)
  const sidePanelRef = useRef(null)
  const mainPanelRef = useRef(null)
  const iconPanelRef = useRef(null)
  const hiddenPanelRef = useRef(null)
  const resizePanelRef = useRef(null)

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
        setListeners()
      })
    }
    if (props.app) {
      console.log('app', props.app)
      activateApp()
    }
  }, [])

  function setListeners () {
    props.app.sidePanel.events.on('toggle', () => {
      console.log('toggle')
      setHideSidePanel(prev => {
        return !prev
      })
    })
    props.app.sidePanel.events.on('showing', () => {
      console.log('showing')
      setHideSidePanel(true)
    })
  }

  const components = {
    iconPanel: <div ref={iconPanelRef} id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light"></div>,
    sidePanel: <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className={`sidepanel border-right border-left ${hideSidePanel ? 'd-none' : ''}`}></div>,
    resizePanel: <div ref={resizePanelRef} id="resize-panel" data-id="remixIdeResizePanel"></div>,
    mainPanel: <div ref={mainPanelRef} id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'></div>,
    hiddenPanel: <div ref={hiddenPanelRef}></div>
  }

  function stopDragSidePanel (e: MouseEvent, data: any) {
    console.log(data)
    setDragState(false)
    sidePanelRef.current.style.width = (320 + data.x) + 'px'
    console.log(sidePanelRef.current.offsetWidth)
    if ((320 + data.x) < 250) {
      setHideSidePanel(true)
      setDragBarPos(41 - 360)
    } else {
      setHideSidePanel(false)
      setDragBarPos(sidePanelRef.current.offsetWidth - 320)
    }
  }

  function startDragSidePanel (e: MouseEvent, data: any) {
    console.log('start')
    setDragState(true)
  }

  return (
    <AppContext.Provider value={{ settings: props.app.settings, showMatamo: props.app.showMatamo, appManager: props.app.appManager }}>
      <RemixSplashScreen hide={appReady}></RemixSplashScreen>
      <AlertModal></AlertModal>
      <MatomoDialog hide={!appReady}></MatomoDialog>

      <div className={`remixIDE ${appReady ? '' : 'd-none'}`} data-id="remixIDE">
        {components.iconPanel}
        {components.sidePanel}
        <Draggable position={{ x: dragBarPos, y: 0 }} onStart={startDragSidePanel} onStop={stopDragSidePanel} axis="x">
          <div className={`dragbar ${dragState ? 'ondrag' : ''}`}></div>
        </Draggable>
        {components.mainPanel}

      </div>
      {components.hiddenPanel}
      <div className={`overlay ${dragState ? '' : 'd-none'}`} ></div>
    </AppContext.Provider>

  )
}

export default RemixApp
