import React, {useEffect, useRef, useState} from 'react'
import './style/remix-app.css'
import {RemixUIMainPanel} from '@remix-ui/panel'
import MatomoDialog from './components/modals/matomo'
import EnterDialog from './components/modals/enter'
import OriginWarning from './components/modals/origin-warning'
import DragBar from './components/dragbar/dragbar'
import {AppProvider} from './context/provider'
import AppDialogs from './components/modals/dialogs'
import DialogViewPlugin from './components/modals/dialogViewPlugin'
import {AppContext} from './context/context'
import {IntlProvider, FormattedMessage} from 'react-intl'
import {CustomTooltip} from '@remix-ui/helper'
import {UsageTypes} from './types'

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || [])

interface IRemixAppUi {
  app: any
}
const RemixApp = (props: IRemixAppUi) => {
  const [appReady, setAppReady] = useState<boolean>(false)
  const [showEnterDialog, setShowEnterDialog] = useState<boolean>(true)
  const [hideSidePanel, setHideSidePanel] = useState<boolean>(false)
  const [maximiseTrigger, setMaximiseTrigger] = useState<number>(0)
  const [resetTrigger, setResetTrigger] = useState<number>(0)
  const [locale, setLocale] = useState<{code: string; messages: any}>({
    code: 'en',
    messages: {}
  })
  const sidePanelRef = useRef(null)

  useEffect(() => {
    async function activateApp() {
      props.app.themeModule.initTheme(() => {
        setAppReady(true)
        props.app.activate()
        setListeners()
      })
      setLocale(props.app.localeModule.currentLocale())
    }
    if (props.app) {
      activateApp()
    }
    const hadUsageTypeAsked = localStorage.getItem('hadUsageTypeAsked')
    setShowEnterDialog(!hadUsageTypeAsked)
  }, [])

  function setListeners() {
    props.app.sidePanel.events.on('toggle', () => {
      setHideSidePanel((prev) => {
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

    props.app.layout.event.on('maximisesidepanel', () => {
      setMaximiseTrigger((prev) => {
        return prev + 1
      })
    })

    props.app.layout.event.on('resetsidepanel', () => {
      setResetTrigger((prev) => {
        return prev + 1
      })
    })
    props.app.localeModule.events.on('localeChanged', (nextLocale) => {
      setLocale(nextLocale)
    })
  }

  const value = {
    settings: props.app.settings,
    showMatamo: props.app.showMatamo,
    showEnter: props.app.showEnter,
    appManager: props.app.appManager,
    modal: props.app.notification,
    layout: props.app.layout
  }

  const handleUserChosenType = async (type) => {
    setShowEnterDialog(false)
    localStorage.setItem('hadUsageTypeAsked', "1")

    await props.app.appManager.call('walkthrough', 'start')

    // Use the type to setup the UI accordingly
    switch (type) {
    case UsageTypes.Beginner: {
      await props.app.appManager.call('manager', 'activatePlugin', 'LearnEth')
      // const wName = 'Playground'
      // const workspaces = await props.app.appManager.call('filePanel', 'getWorkspaces')
      // if (!workspaces.find((workspace) => workspace.name === wName)) {
      //   await props.app.appManager.call('filePanel', 'createWorkspace', wName, 'playground')
      // }
      // await props.app.appManager.call('filePanel', 'switchToWorkspace', { name: wName, isLocalHost: false })

      _paq.push(['trackEvent', 'enterDialog', 'usageType', 'beginner'])
      break
    }
    case UsageTypes.Tutor: {
      _paq.push(['trackEvent', 'enterDialog', 'usageType', 'tutor'])
      break
    }
    case UsageTypes.Prototyper: {
      _paq.push(['trackEvent', 'enterDialog', 'usageType', 'prototyper'])
      break
    }
    case UsageTypes.Production: {
      _paq.push(['trackEvent', 'enterDialog', 'usageType', 'production'])
      break
    }
    default: throw new Error()
    }

  }

  return (
    //@ts-ignore
    <IntlProvider locale={locale.code} messages={locale.messages}>
      <AppProvider value={value}>
        <OriginWarning></OriginWarning>
        <MatomoDialog hide={!appReady} okFn={() => {setShowEnterDialog(true)}}>
        </MatomoDialog>
        <EnterDialog hide={!showEnterDialog} handleUserChoice={(type) => handleUserChosenType(type)}></EnterDialog>
        <div className={`remixIDE ${appReady ? '' : 'd-none'}`} data-id="remixIDE">
          <div id="icon-panel" data-id="remixIdeIconPanel" className="custom_icon_panel iconpanel bg-light">
            {props.app.menuicons.render()}
          </div>
          <div
            ref={sidePanelRef}
            id="side-panel"
            data-id="remixIdeSidePanel"
            className={`sidepanel border-right border-left ${hideSidePanel ? 'd-none' : ''}`}
          >
            {props.app.sidePanel.render()}
          </div>
          <DragBar
            resetTrigger={resetTrigger}
            maximiseTrigger={maximiseTrigger}
            minWidth={285}
            refObject={sidePanelRef}
            hidden={hideSidePanel}
            setHideStatus={setHideSidePanel}
          ></DragBar>
          <div id="main-panel" data-id="remixIdeMainPanel" className="mainpanel d-flex">
            <RemixUIMainPanel Context={AppContext}></RemixUIMainPanel>
            <CustomTooltip placement="bottom" tooltipId="overlay-tooltip-all-tabs" tooltipText={<FormattedMessage id="remixApp.scrollToSeeAllTabs" />}>
              <div className="remix-ui-tabs_end remix-bg-opacity position-absolute position-fixed"></div>
            </CustomTooltip>
          </div>
        </div>
        <div>{props.app.hiddenPanel.render()}</div>
        <AppDialogs></AppDialogs>
        <DialogViewPlugin></DialogViewPlugin>
      </AppProvider>
    </IntlProvider>
  )
}

export default RemixApp
