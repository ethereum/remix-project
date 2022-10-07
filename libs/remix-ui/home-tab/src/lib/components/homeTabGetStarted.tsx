/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'

function HomeTabGetStarted () {
  const [state, setState] = useState<{
    searchInput: string
  }>({
    searchInput: ''
  })

  return (
    <div className="pl-2 pb-2" id="hTGetStartedSection">
      <label style={{fontSize: "1.2rem"}}>Get Started<span className="ml-2">- Project Templatea</span></label>
      <div className="border"></div>
    </div>
  )
}

export default HomeTabGetStarted
