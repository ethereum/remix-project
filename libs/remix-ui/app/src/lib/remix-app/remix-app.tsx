import React, { useContext, useEffect, useRef, useState } from 'react'
import './style/remix-app.css'
import { RemixUIMainPanel } from '@remix-ui/panel'
import MatomoDialog from './components/modals/matomo'
import OriginWarning from './components/modals/origin-warning'
import DragBar from './components/dragbar/dragbar'
import { AppProvider } from './context/provider'
import AppDialogs from './components/modals/dialogs'
import DialogViewPlugin from './components/modals/dialogViewPlugin'
import { AppContext } from './context/context'
import { RemixUiVerticalIconsPanel } from '@remix-ui/vertical-icons-panel'

interface IRemixAppUi {
  app: any
}

const RemixApp = (props: IRemixAppUi) => {
  const [appReady, setAppReady] = useState<boolean>(false)
  const [hideSidePanel, setHideSidePanel] = useState<boolean>(false)
  const sidePanelRef = useRef(null)
  const iconPanelRef = useRef(null)
  const hiddenPanelRef = useRef(null)

  useEffect(() => {
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
  }, [])


  useEffect(() => {
    console.log(props.app.menuicons)
  }, [props.app.menuicons])

  function setListeners () {
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
    hiddenPanel: <div ref={hiddenPanelRef}></div>
  }

  const value = {
    settings: props.app.settings,
    showMatamo: props.app.showMatamo,
    appManager: props.app.appManager,
    modal: props.app.notification,
    layout: props.app.layout
  }

  return (
    <AppProvider value={value}>
      <OriginWarning></OriginWarning>
      <MatomoDialog hide={!appReady}></MatomoDialog>

      <div className={`remixIDE ${appReady ? '' : 'd-none'}`} data-id="remixIDE">
        <div ref={iconPanelRef} id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light"><ViewPluginUI plugin={props.app.menuicons}></ViewPluginUI></div>
        <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className={`sidepanel border-right border-left ${hideSidePanel ? 'd-none' : ''}`}><ViewPluginUI plugin={props.app.sidePanel}></ViewPluginUI></div>
        <DragBar minWidth={250} refObject={sidePanelRef} hidden={hideSidePanel} setHideStatus={setHideSidePanel}></DragBar>
        <div id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'>
          <RemixUIMainPanel Context={AppContext}></RemixUIMainPanel>
        </div>
      </div>
      <div ref={hiddenPanelRef}><ViewPluginUI plugin={props.app.hiddenPanel}></ViewPluginUI></div>
      <AppDialogs></AppDialogs>
      <DialogViewPlugin></DialogViewPlugin>
    </AppProvider>
  )
}

interface IViewPluginUI {
  plugin: any
}

export const ViewPluginUI = (props: IViewPluginUI) => {

  const [state, setState] = useState<any>(null)

  useEffect(() => {
    console.log(props.plugin)
    if(props.plugin.setDispatch){
      props.plugin.setDispatch(setState)
    }
  }, [])

  useEffect(() => {
    console.log(state)
  }, [state])

  return (
    <>{state? 
      props.plugin.render(state)
    :<></>
    }</>
  )
}


export default RemixApp
