import React, { useContext, useState, useEffect } from 'react'
import './remix-ui-home-tab.css'
import { ThemeContext, themes } from './themeContext'
import HomeTabTitle from './components/homeTabTitle'
import HomeTabRecentWorkspaces from './components/homeTabRecentWorkspaces'
import HomeTabScamAlert from './components/homeTabScamAlert'
import HomeTabFeaturedPlugins from './components/homeTabFeaturedPlugins'
import { AppContext, appPlatformTypes, platformContext } from '@remix-ui/app'
import { HomeTabFileElectron } from './components/homeTabFileElectron'
import HomeTabUpdates from './components/homeTabUpdates'
import { FormattedMessage } from 'react-intl'
// import { desktopConnectionType } from '@remix-api'
import { desktopConnectionType } from '@remix-api'

declare global {
  interface Window {
    _paq: any
  }
}

export interface RemixUiHomeTabProps {
  plugin: any
}

const _paq = (window._paq = window._paq || []) // eslint-disable-line

// --- Main Layout ---
export const RemixUiHomeTab = (props: RemixUiHomeTabProps) => {
  const platform = useContext(platformContext)
  const appContext = useContext(AppContext)
  const { plugin } = props

  const [state, setState] = useState<{
    themeQuality: { filter: string; name: string }
  }>({
    themeQuality: themes.light
  })

  useEffect(() => {
    plugin.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      setState((prevState) => {
        return {
          ...prevState,
          themeQuality: theme.quality === 'dark' ? themes.dark : themes.light
        }
      })
    })
    plugin.on('theme', 'themeChanged', (theme) => {
      // update theme quality. To be used for for images
      setState((prevState) => {
        return {
          ...prevState,
          themeQuality: theme.quality === 'dark' ? themes.dark : themes.light
        }
      })
    })
  }, [])

  const startLearnEth = async () => {
    if (await plugin.appManager.isActive('LearnEth')) {
      plugin.verticalIcons.select('LearnEth')
    } else {
      await plugin.appManager.activatePlugin(['LearnEth', 'solidity', 'solidityUnitTesting'])
      plugin.verticalIcons.select('LearnEth')
    }
    _paq.push(['trackEvent', 'hometab', 'header', 'Start Learning'])
  }

  const openTemplateSelection = async () => {
    await plugin.call('manager', 'activatePlugin', 'templateSelection')
    await plugin.call('tabs', 'focus', 'templateSelection')
    _paq.push(['trackEvent', 'hometab', 'header', 'Create a new workspace'])
  }

  // if (appContext.appState.connectedToDesktop != desktopConnectionType.disabled) {
  //   return (<></>)
  // }

  return (
    <div className="d-flex flex-column w-100" data-id="remixUIHTAll">
      <ThemeContext.Provider value={state.themeQuality}>
        <div className="container-fluid">
          <div className="row">
            <div className="d-flex w-100 m-3 justify-content-end">
              <button className="btn btn-secondary btn-md mr-3" onClick={startLearnEth}><i className="fa-solid fa-book mr-1"></i><FormattedMessage id="home.startLearning" /></button>
              <button data-id="landingPageImportFromTemplate" className="btn btn-primary btn-md mr-2" onClick={openTemplateSelection}><i className="fa-solid fa-plus mr-1"></i><FormattedMessage id="home.createNewWorkspace" /></button>
            </div>
            <div className="col-lg-8 col-xl-5 col-sm-12 mb-4">
              <HomeTabTitle />
              <HomeTabRecentWorkspaces plugin={plugin} />
              {/* {!(platform === appPlatformTypes.desktop) ? <HomeTabFile plugin={plugin} /> : <HomeTabFileElectron plugin={plugin}></HomeTabFileElectron>} */}
            </div>
            <div className="col-lg-4 col-xl-7 col-sm-12" style={{ overflowY: 'auto', maxHeight: '65vh' }}>
              <HomeTabUpdates plugin={plugin} />
              <HomeTabFeaturedPlugins plugin={plugin} />
            </div>
          </div>
        </div>
      </ThemeContext.Provider>
    </div>
  )
}

export default RemixUiHomeTab
