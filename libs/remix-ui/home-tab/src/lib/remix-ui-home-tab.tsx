import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line

import './remix-ui-home-tab.css'
import { ThemeContext, themes } from './themeContext'
import { RSSFeed } from './components/rssFeed'
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
const _paq = window._paq = window._paq || [] //eslint-disable-line

/* eslint-disable-next-line */
export interface RemixUiHomeTabProps {
  plugin: any
}

export const RemixUiHomeTab = (props: RemixUiHomeTabProps) => {
  const { plugin } = props

  const [state, setState] = useState<{
    themeQuality: { filter: string, name: string },
    showMediaPanel: 'none' | 'twitter' | 'medium'
  }>({
    themeQuality: themes.light,
    showMediaPanel: 'none'
  })

  const rightPanel = useRef(null)

  useEffect(() => {
    plugin.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      console.log("currentTheme on ", theme.quality )
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
    window.addEventListener('click', (event) => {
      const target = event.target as Element
      const id = target.id
      if (id !== 'remixIDEHomeTwitterbtn' && id !== 'remixIDEHomeMediumbtn' && (rightPanel && rightPanel.current && !rightPanel.current.contains(event.target))) {
        // todo check event.target
        setState(prevState => { return { ...prevState, showMediaPanel: 'none' } })
      }
    })
    // to retrieve twitter feed
    const scriptTwitter = document.createElement('script')
    scriptTwitter.src = 'https://platform.twitter.com/widgets.js'
    scriptTwitter.async = true
    document.body.appendChild(scriptTwitter)
    
    return () => {
      document.body.removeChild(scriptTwitter)
    }
  }, [])
  

  
  return (
    <div className="d-flex flex-row w-100" id="remixUIHTAll">
      <ThemeContext.Provider value={ state.themeQuality }>
        <div className="px-2 pl-3 justify-content-between d-flex border-right flex-column" id="remixUIHTLeft" style={{flex: 2, minWidth: "35%"}}>
          <HomeTabTitle />
          <HomeTabFile plugin={plugin} />
          <HomeTabLearn plugin={plugin} />
        </div>
        <div className="pl-2 pr-3 justify-content-between d-flex flex-column" style={{width: "65%"}} id="remixUIHTRight">
          <HomeTabFeatured></HomeTabFeatured>
          <HomeTabFeaturedPlugins plugin={plugin}></HomeTabFeaturedPlugins>
          <HomeTabGetStarted plugin={plugin}></HomeTabGetStarted>
          <HomeTabScamAlert></HomeTabScamAlert>
        </div>
      </ThemeContext.Provider>
    </div>
  )
}

export default RemixUiHomeTab


/*
  

  const maxHeight = Math.max(window.innerHeight - 150, 250) + 'px'
  const elHeight = '4000px'
<div className="d-flex flex-column ml-4" id="remixUiRightPanel">
        <div className="border-bottom d-flex flex-column mr-4 pb-3 mb-3">
          <div className="pt-2 d-flex justify-content-between">
            <div>
              <div className="mx-4 my-4 pt-4 d-flex">
                <label style={ { fontSize: 'xxx-large' } }>Remix IDE</label>
              </div>
              
            </div>
            <div className="mr-4 d-flex">
              <img className="align-self-end remixui_home_logoImg" src="assets/img/guitarRemiCroped.webp" onClick={ () => playRemi() } alt=""></img>
              <audio
                id="remiAudio"
                muted={false}
                src="assets/audio/remiGuitar-single-power-chord-A-minor.wav"
                ref={remiAudioEl}
              ></audio>
            </div>
          </div>
        </div>
        <div className="row mx-2 mr-4" data-id="landingPageHpSections">
          <div className="ml-3">
            <div className="mb-3">
              <h4>Featured Plugins</h4>
              <div className="d-flex flex-row pt-2">
                <ThemeContext.Provider value={ state.themeQuality }>
                  <PluginButton imgPath="assets/img/solidityLogo.webp" envID="solidityLogo" envText="Solidity" callback={() => startSolidity()} />
                  <PluginButton imgPath="assets/img/starkNetLogo.webp" envID="starkNetLogo" envText="StarkNet" l2={true} callback={() => startStarkNet()} />
                  <PluginButton imgPath="assets/img/solhintLogo.webp" envID="solhintLogo" envText="Solhint linter" callback={() => startSolhint()} />
                  <PluginButton imgPath="assets/img/learnEthLogo.webp" envID="learnEthLogo" envText="LearnEth" callback={() => startLearnEth()} />
                  <PluginButton imgPath="assets/img/sourcifyNewLogo.webp" envID="sourcifyLogo" envText="Sourcify" callback={() => startSourceVerify()} />
                  <PluginButton imgPath="assets/img/moreLogo.webp" envID="moreLogo" envText="More" callback={startPluginManager} />
                </ThemeContext.Provider>
              </div>
            </div>
            ------------------------
              <div className="ml-4 pl-4">
                <h4>Resources</h4>
                <p className="mb-1">
                  <i className="mr-2 fas fa-book"></i>
                  <a className="remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#">Documentation</a>
                </p>
                <p className="mb-1">
                  <i className="mr-2 fab fa-gitter"></i>
                  <a className="remixui_home_text" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a>
                </p>
                <p className="mb-1">
                  <img id='remixHhomeWebsite' className="mr-2 remixui_home_image" src={ plugin.profile.icon } style={ { filter: state.themeQuality.filter } } alt=''></img>
                  <a className="remixui_home_text" target="__blank" href="https://remix-project.org">Featuring website</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column remixui_home_rightPanel">
          <div className="d-flex pr-3 py-2 align-self-end" id="remixIDEMediaPanelsTitle">
            <button
              className="btn-info p-2 m-1 border rounded-circle remixui_home_mediaBadge fab fa-twitter"
              id="remixIDEHomeTwitterbtn"
              title="Twitter"
              onClick={(e) => {
                setState(prevState => {
                  return { ...prevState, showMediaPanel: state.showMediaPanel === 'twitter' ? 'none' : 'twitter' }
                })
                _paq.push(['trackEvent', 'pluginManager', 'media', 'twitter'])
              }}
            ></button>
            <button
              className="btn-danger p-2 m-1 border rounded-circle remixui_home_mediaBadge fab fa-medium"
              id="remixIDEHomeMediumbtn"
              title="Medium blogs"
              onClick={(e) => {
                setState(prevState => {
                  return { ...prevState, showMediaPanel: state.showMediaPanel === 'medium' ? 'none' : 'medium' }
                })
                _paq.push(['trackEvent', 'pluginManager', 'media', 'medium'])
              }}
            ></button>
          </div>
          <div
            className="mr-3 d-flex bg-light remixui_home_panels"
            style={ { visibility: state.showMediaPanel === 'none' ? 'hidden' : 'visible' } }
            id="remixIDEMediaPanels"
            ref={rightPanel}
          >
            <div id="remixIDE_MediumBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" style={ { maxHeight: maxHeight } }>
              <div id="medium-widget" className="px-3 remixui_home_media" hidden={state.showMediaPanel !== 'medium'} style={ { maxHeight: '10000px' } }>
                <RSSFeed feedUrl='https://rss.remixproject.org/' maxItems={10} />
              </div>
            </div>
            <div id="remixIDE_TwitterBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" hidden={state.showMediaPanel !== 'twitter'} style={ { maxHeight: maxHeight, marginRight: '28px' } } >
              <div className="remixui_home_media" style={ { minHeight: elHeight } } >
                <a className="twitter-timeline"
                  data-width="375"
                  data-theme={ state.themeQuality.name }
                  data-chrome="nofooter noheader transparent"
                  data-tweet-limit="18"
                  href="https://twitter.com/EthereumRemix"
                >
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      */