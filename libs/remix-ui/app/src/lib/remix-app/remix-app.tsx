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
        <div id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light">{props.app.menuicons.render()}</div>
        <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className={`sidepanel border-right border-left ${hideSidePanel ? 'd-none' : ''}`}>{props.app.sidePanel.render()}</div>
        <DragBar minWidth={250} refObject={sidePanelRef} hidden={hideSidePanel} setHideStatus={setHideSidePanel}></DragBar>
        <div id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'>
          <RemixUIMainPanel Context={AppContext}></RemixUIMainPanel>
        </div>
      </div>
      <div>{props.app.hiddenPanel.render()}</div>
      <AppDialogs></AppDialogs>
      <DialogViewPlugin></DialogViewPlugin>
    </AppProvider>
  )
}

export default RemixApp
