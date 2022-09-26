/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'

function HomeTabTitle () {
  const [state, setState] = useState<{
    searchInput: string
  }>({
    searchInput: ''
  })
  useEffect(() => {
  
    document.addEventListener("keyup", (e) => handleSearchKeyDown(e))
    
    return () => {
      document.removeEventListener("keyup", handleSearchKeyDown)
    }
  }, [])

  const searchInputRef = useRef(null)
  const remiAudioEl = useRef(null)

  const playRemi = async () => {
    remiAudioEl.current.play()
  }
  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.target !== searchInputRef.current) return
    if (e.key === "Enter") {
      openLink()
      setState(prevState => {
        return { ...prevState, searchInput: '' }
      })
      searchInputRef.current.value = ""
    }
  }

  const openLink = (url = "") => {
    if (url === "") {
      window.open("https://remix-ide.readthedocs.io/en/latest/search.html?q=" + state.searchInput + "&check_keywords=yes&area=default", '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="px-2 pb-2 pt-2 d-flex flex-column border-bottom" id="hTTitleSection">
      <div className="mr-4 d-flex">
        <img className="align-self-end remixui_home_logoImg" src="assets/img/guitarRemiCroped.webp" onClick={ () => playRemi() } alt=""></img>
        <audio
          id="remiAudio"
          muted={false}
          src="assets/audio/remiGuitar-single-power-chord-A-minor.wav"
          ref={remiAudioEl}
        ></audio>
      </div>
      <div className="d-flex justify-content-between">
        <span className="h-80" style={ { fontSize: 'xx-large', fontFamily: "Noah" } }>Remix</span>
        <span>
          <button
            onClick={ ()=> openLink("https://www.youtube.com/channel/UCjTUPyFEr2xDGN6Cg8nKDaA")}
            className="h-100 btn fab fa-youtube">
          </button>
          <button
            onClick={ ()=> openLink("https://twitter.com/EthereumRemix")}
            className="h-100 pl-2 btn fab fa-twitter">
          </button>
          <button
            onClick={ ()=> openLink(" https://www.linkedin.com/company/ethereum-remix/")}
            className="h-100 pl-2 btn fab fa-linkedin-in">
          </button>
        </span>
      </div>
      <b className="pb-1 text-dark" style={{fontStyle: 'italic'}}>The Native IDE for Solidity Development.</b>
      <div className="pb-1" id="hTGeneralLinks">
        <a className="remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest">Learn more</a>
        <a className="pl-2 remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest">Documentation</a>
        <a className="pl-2 remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest">more</a>
        <a className="pl-2 remixui_home_text" target="__blank" href="https://remix-ide.readthedocs.io/en/latest">more</a>
      </div>
      <div className="d-flex pb-1 align-items-center">
        <input
          ref={searchInputRef}
          onChange={(event) => {
            setState(prevState => {
              return { ...prevState, searchInput: event.target.value.trim() }
            })
          }}
          type="text"
          className="border form-control border-right-0"
          id="searchInput"
          placeholder="Search Documentation"
          data-id="terminalInputSearch"
        />
        <button
          className="form-control border d-flex align-items-center p-2 justify-content-center fas fa-search bg-light"
          onClick={ (e) => openLink() }
          disabled={state.searchInput === ""}
          style={{width: "3rem"}}
        >
        </button>
      </div>
    </div>
  )
}

export default HomeTabTitle
