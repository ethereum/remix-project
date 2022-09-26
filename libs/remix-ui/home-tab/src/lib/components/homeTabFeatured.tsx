/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'

function HomeTabFeatured () {
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
    <div className="" id="hTFeaturedeSection">
      <label style={{fontSize: "1.2rem"}}>Featured</label>
      <div className="border"></div>
    </div>
  )
}

export default HomeTabFeatured
