/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomTooltip } from '@remix-ui/helper'
import { Placement } from 'react-bootstrap/esm/Overlay'
const _paq = (window._paq = window._paq || []) // eslint-disable-line

type HometabIconSection = {
  textToolip: JSX.Element
  urlLink: string
  iconClass: 'fa-youtube'|'fa-x-twitter'|'fa-linkedin'|'fa-medium'|'fa-discord'
  placement: Placement
  matomoTrackingEntry: string[]
}

const iconButtons: HometabIconSection[] = [
  {
    textToolip: <FormattedMessage id="home.remixYoutubePlaylist" />,
    matomoTrackingEntry: ['trackEvent', 'hometab', 'socialMedia', 'youtube'],
    urlLink: 'https://www.youtube.com/channel/UCjTUPyFEr2xDGN6Cg8nKDaA',
    iconClass: 'fa-youtube',
    placement: 'top'
  },
  {
    textToolip: <FormattedMessage id="home.remixTwitterProfile" />,
    matomoTrackingEntry: ['trackEvent', 'hometab', 'socialMedia', 'twitter'],
    urlLink: 'https://twitter.com/EthereumRemix',
    iconClass: 'fa-x-twitter',
    placement: 'top'
  },
  {
    textToolip: <FormattedMessage id="home.remixLinkedinProfile" />,
    matomoTrackingEntry: ['trackEvent', 'hometab', 'socialmedia', 'linkedin'],
    urlLink: 'https://www.linkedin.com/company/ethereum-remix/',
    iconClass: 'fa-linkedin',
    placement: 'top'
  },
  {
    textToolip: <FormattedMessage id="home.remixMediumPosts" />,
    matomoTrackingEntry: ['trackEvent', 'hometab', 'socialmedia', 'medium'],
    urlLink: 'https://medium.com/remix-ide',
    iconClass: 'fa-medium',
    placement: 'top'
  },
  {
    textToolip: <FormattedMessage id="home.joinUsOnDiscord" />,
    matomoTrackingEntry: ['trackEvent', 'hometab', 'socialmedia', 'discord'],
    urlLink: 'https://discord.gg/mh9hFCKkEq',
    iconClass: 'fa-discord',
    placement: 'top'
  }
]

function HomeTabTitle() {
  useEffect(() => {
    document.addEventListener('keyup', (e) => handleSearchKeyDown(e))
    return () => {
      document.removeEventListener('keyup', handleSearchKeyDown)
    }
  }, [])
  const [state, setState] = useState<{
    searchDisable: boolean
  }>({
    searchDisable: true
  })

  const searchInputRef = useRef(null)
  const remiAudioEl = useRef(null)
  const intl = useIntl()

  const playRemi = async () => {
    remiAudioEl.current.play()
  }
  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.target !== searchInputRef.current) return
    if (e.key === 'Enter') {
      _paq.push(['trackEvent', 'hometab', 'header', 'searchDocumentation'])
      openLink()
      searchInputRef.current.value = ''
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          searchDisable: searchInputRef.current.value === ''
        }
      })
    }
  }

  const openLink = (url = '') => {
    if (url === '') {
      window.open('https://remix-ide.readthedocs.io/en/latest/search.html?q=' + searchInputRef.current.value + '&check_keywords=yes&area=default', '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="px-2 pb-2 pt-2 d-flex flex-column border-bottom" id="hTTitleSection">
      <div className="d-flex py-2 justify-content-between">
        <div className="d-flex justify-content-start">
          <span className="h-80 text-uppercase" style={{ fontSize: 'xx-large', fontFamily: 'Noah, sans-serif' }}>
            Remix
          </span>
          <div className="ml-2 d-flex">
            <div onClick={() => playRemi()}>
              <img className="" src="assets/img/guitarRemiCroped.webp" style={{ height: '3rem' }} alt=""></img>
            </div>
            <audio id="remiAudio" muted={false} src="assets/audio/remiGuitar-single-power-chord-A-minor.mp3" ref={remiAudioEl}></audio>
          </div>
        </div>
        <span className="d-flex flex-nowrap align-self-end">
          {iconButtons.map((button, index) => (
            <CustomTooltip
              key={index}
              placement={button.placement}
              tooltipId="overlay-tooltip"
              tooltipClasses="text-nowrap"
              tooltipText={button.textToolip}
              tooltipTextClasses="border bg-light text-dark p-1 pr-3"
            >
              <button
                key={index}
                onClick={() => {
                  openLink(button.urlLink)
                  _paq.push(button.matomoTrackingEntry)
                }}
                className={`border-0 h-100 pl-1 pr-0 btn fab ${button.iconClass}`}
              ></button>
            </CustomTooltip>
          ))}
        </span>
      </div>
      <b className="py-1 text-dark" style={{ fontStyle: 'italic' }}>
        <FormattedMessage id="home.nativeIDE" />
      </b>
      <div className="pb-1" id="hTGeneralLinks">
        <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'webSite'])} target="__blank" href="https://remix-project.org">
          <FormattedMessage id="home.website" />
        </a>
        {/* <a
          className="pl-2 remixui_home_text"
          onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'documentation'])}
          target="__blank"
          href="https://remix-ide.readthedocs.io/en/latest"
        >
          <FormattedMessage id="home.documentation" />
        </a> */}
        <a
          className="pl-2 remixui_home_text"
          onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'remixDesktop'])}
          target="__blank"
          href="https://github.com/remix-project-org/remix-desktop-insiders"
        >
          <FormattedMessage id="home.remixDesktop" />
        </a>
      </div>
      <div className="d-flex pb-1 align-items-center">
        <input
          ref={searchInputRef}
          type="text"
          className="border form-control border-right-0"
          id="homeTabSearchInput"
          placeholder={intl.formatMessage({ id: 'home.searchDocumentation' })}
          data-id="terminalInputSearchHome"
        />
        <button
          className="form-control border d-flex align-items-center p-2 justify-content-center fas fa-search bg-light"
          onClick={(e) => {
            _paq.push(['trackEvent', 'hometab', 'header', 'searchDocumentation'])
            openLink()
          }}
          disabled={state.searchDisable}
          style={{ width: '3rem' }}
        ></button>
      </div>
    </div>
  )
}

export default HomeTabTitle
