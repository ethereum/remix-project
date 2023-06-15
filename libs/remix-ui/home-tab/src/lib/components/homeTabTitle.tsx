/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomTooltip } from '@remix-ui/helper'
const _paq = window._paq = window._paq || [] // eslint-disable-line


function HomeTabTitle () {
  useEffect(() => {
    document.addEventListener("keyup", (e) => handleSearchKeyDown(e))
    return () => {
      document.removeEventListener("keyup", handleSearchKeyDown)
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
    if (e.key === "Enter") {
      _paq.push(['trackEvent', 'hometab', 'header', 'searchDocumentation'])
      openLink()
      searchInputRef.current.value = ""
    } else {
      setState(prevState => {
        return { ...prevState, searchDisable: searchInputRef.current.value === "" }
      })
    }
  }

  const openLink = (url = "") => {
    if (url === "") {
      window.open("https://remix-ide.readthedocs.io/en/latest/search.html?q=" + searchInputRef.current.value + "&check_keywords=yes&area=default", '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="px-2 pb-2 pt-2 d-flex flex-column border-bottom" id="hTTitleSection">
      <div className="d-flex py-2 justify-content-between">
        <div className='d-flex justify-content-start'>
          <span className="h-80 text-uppercase" style={{ fontSize: 'xx-large', fontFamily: "Noah, sans-serif" }}>Remix</span>
          <div className="ml-2 d-flex">
            <div onClick={() => playRemi()} >
              <img className="" src="assets/img/guitarRemiCroped.webp" style={{ height: "3rem" }} alt=""></img>
            </div>
            <audio
              id="remiAudio"
              muted={false}
              src="assets/audio/remiGuitar-single-power-chord-A-minor.mp3"
              ref={remiAudioEl}
            ></audio>
          </div>
        </div>
        <span className="d-flex flex-nowrap align-self-end">
          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="home.remixYoutubePlaylist" />}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button
              onClick={() => {
                openLink("https://www.youtube.com/channel/UCjTUPyFEr2xDGN6Cg8nKDaA")
                _paq.push(['trackEvent', 'hometab', 'socialMedia', 'youtube'])
              }}
              className="border-0 px-1 h-100 btn fab fa-youtube">
            </button>
          </CustomTooltip>
          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="home.remixTwitterProfile" />}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button
              onClick={() => {
                openLink("https://twitter.com/EthereumRemix")
                _paq.push(['trackEvent', 'hometab', 'socialMedia', 'twitter'])
              }}
              className="border-0 px-1 h-100 btn fab fa-twitter">
            </button>
          </CustomTooltip>
          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="home.remixLinkedinProfile" />}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button
              onClick={() => {
                openLink("https://www.linkedin.com/company/ethereum-remix/")
                _paq.push(['trackEvent', 'hometab', 'socialmedia', 'linkedin'])
              }}
              className="border-0 px-1 h-100 btn fa fa-linkedin">
            </button>
          </CustomTooltip>
          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="home.remixMediumPosts" />}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button
              onClick={() => {
                openLink("https://medium.com/remix-ide")
                _paq.push(['trackEvent', 'hometab', 'socialmedia', 'medium'])
              }}
              className="border-0 h-100 px-1 btn fab fa-medium">
            </button>
          </CustomTooltip>

          <CustomTooltip
            placement={'top'}
            tooltipId="overlay-tooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="home.remixGitterChannel" />}
            tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          >
            <button
              onClick={() => {
                openLink("https://discord.gg/mh9hFCKkEq")
                _paq.push(['trackEvent', 'hometab', 'socialmedia', 'discord'])
              }}
              className="border-0 h-100 pl-1 pr-0 btn fab fa-discord">
            </button>
          </CustomTooltip>
        </span>
      </div>
      <b className="py-1 text-dark" style={{ fontStyle: 'italic' }}>
        <FormattedMessage id="home.nativeIDE" />
      </b>
      <div className="pb-1" id="hTGeneralLinks">
        <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'webSite'])} target="__blank" href="https://remix-project.org">
          <FormattedMessage id="home.website" />
        </a>
        <a className="pl-2 remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'documentation'])} target="__blank" href="https://remix-ide.readthedocs.io/en/latest">
          <FormattedMessage id="home.documentation" />
        </a>
        <a className="pl-2 remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'remixPlugin'])} target="__blank" href="https://remix-plugin-docs.readthedocs.io/en/latest/">
          <FormattedMessage id="home.remixPlugin" />
        </a>
        <a className="pl-2 remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'header', 'remixDesktop'])} target="__blank" href="https://github.com/ethereum/remix-desktop/releases">
          <FormattedMessage id="home.remixDesktop" />
        </a>
      </div>
      <div className="d-flex pb-1 align-items-center">
        <input
          ref={searchInputRef}
          type="text"
          className="border form-control border-right-0"
          id="homeTabSearchInput"
          placeholder={intl.formatMessage({ id: "home.searchDocumentation" })}
          data-id="terminalInputSearch"
        />
        <button
          className="form-control border d-flex align-items-center p-2 justify-content-center fas fa-search bg-light"
          onClick={(e) => {
            _paq.push(['trackEvent', 'hometab', 'header', 'searchDocumentation'])
            openLink()
          }}
          disabled={state.searchDisable}
          style={{ width: "3rem" }}
        >
        </button>
      </div>
    </div>
  )
}

export default HomeTabTitle