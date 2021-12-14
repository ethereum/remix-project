import React, { useEffect, useRef, useState } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog'
import './remix-app.css'

interface IRemixAppUi {
  app: any
}
export const RemixApp = (props: IRemixAppUi) => {
  const [visible, setVisible] = useState<boolean>(false)
  const sidePanelRef = useRef(null)
  const mainPanelRef = useRef(null)
  const iconPanelRef = useRef(null)
  const hiddenPanelRef = useRef(null)

  useEffect(() => {

  })

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
    if (props.app) {
      console.log('app', props.app)
      props.app.activate()
    }
  }, [])

  const components = {
    iconPanel: <div ref={iconPanelRef} id="icon-panel" data-id="remixIdeIconPanel" className="iconpanel bg-light"></div>,
    sidePanel: <div ref={sidePanelRef} id="side-panel" data-id="remixIdeSidePanel" className="sidepanel border-right border-left"></div>,
    mainPanel: <div ref={mainPanelRef} id="main-panel" data-id="remixIdeMainPanel" className='mainpanel'></div>,
    hiddenPanel: <div ref={hiddenPanelRef}></div>
  }

  const handleModalOkClick = async () => {

  }

  const closeModal = async () => {

  }

  return (
    <>
      <div className='remixIDE' hidden={false} data-id="remixIDE">
        {components.iconPanel}
        {components.sidePanel}
        {components.mainPanel}
      </div>
      <ModalDialog
        handleHide={closeModal}
        id="pluginManagerLocalPluginModalDialog"
        hide={!visible}
        title="Modal"
        okLabel="OK"
        okFn={ handleModalOkClick }
        cancelLabel="Cancel"
        cancelFn={closeModal}
      >test</ModalDialog>
      {components.hiddenPanel}
    </>

  )
}

export default RemixApp
