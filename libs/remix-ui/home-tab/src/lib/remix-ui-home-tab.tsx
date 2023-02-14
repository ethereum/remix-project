import React, { useState, useEffect } from 'react' // eslint-disable-line

import './remix-ui-home-tab.css'
import { ThemeContext, themes } from './themeContext'
import HomeTabTitle from './components/homeTabTitle'
import HomeTabFile from './components/homeTabFile'
import HomeTabLearn from './components/homeTabLearn'
import HomeTabScamAlert from './components/homeTabScamAlert'
import HomeTabGetStarted from './components/homeTabGetStarted'
import HomeTabFeatured from './components/homeTabFeatured'
import HomeTabFeaturedPlugins from './components/homeTabFeaturedPlugins'

declare global {
  interface Window {
    _paq: any
  }
}

export interface RemixUiHomeTabProps {
  plugin: any
}

export const RemixUiHomeTab = (props: RemixUiHomeTabProps) => {
  const { plugin } = props

  const [state, setState] = useState<{
    themeQuality: { filter: string, name: string },
  }>({
    themeQuality: themes.light,
  })

  useEffect(() => {
    plugin.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
    plugin.on('theme', 'themeChanged', (theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
  }, [])

  return (
    <div className="d-flex flex-column w-100" data-id="remixUIHTAll">
      <ThemeContext.Provider value={ state.themeQuality }>
        <div className='d-flex flex-row w-100'>
          <div className="px-2 pl-3 justify-content-start d-flex border-right flex-column" id="remixUIHTLeft" style={{ width: 'inherit' }}>
            <HomeTabTitle />
            <HomeTabFile plugin={plugin} />
            <HomeTabLearn plugin={plugin} />
          </div>
          <div className="pl-2 pr-3 justify-content-start d-flex flex-column" style={{width: "65%"}} id="remixUIHTRight">
            <HomeTabFeatured></HomeTabFeatured>
            <HomeTabGetStarted plugin={plugin}></HomeTabGetStarted>
            <HomeTabFeaturedPlugins plugin={plugin}></HomeTabFeaturedPlugins>
            <HomeTabScamAlert></HomeTabScamAlert>
          </div>
        </div>
      </ThemeContext.Provider>
    </div>
  )
}

export default RemixUiHomeTab
