/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { ThemeContext } from '../themeContext'

enum VisibleTutorial {
  Basics,
  Intermediate,
  Advanced
}

function HomeTabLearn () {
  const [state, setState] = useState<{
    visibleTutorial: VisibleTutorial
  }>({
    visibleTutorial: VisibleTutorial.Basics
  })

  const themeFilter = useContext(ThemeContext)

  const openLink = () => {
      window.open("https://remix-ide.readthedocs.io/en/latest/search.html?q=learneth&check_keywords=yes&area=default", '_blank')
  }

  return (
    <div className="d-flex px-2 pb-2 pt-2 d-flex flex-column" id="hTLearnSection">
      <div className="d-flex justify-content-between">
        <label className="pt-2 align-self-center m-0">Learn</label>
        <button
          onClick={ ()=> openLink()}
          className="h-100 px-2 pt-0 btn"
        >
          <img className="align-self-center" src="assets/img/learnEthLogo.webp" alt="" style={ { filter: themeFilter.filter, width: "1rem", height: "1ren" } } />
        </button>
      </div>
      <div className="d-flex flex-column">
        <button className="btn border" onClick={() => setState((prevState) => {return { ...prevState, visibleTutorial: VisibleTutorial.Basics }})}>
          {(state.visibleTutorial === VisibleTutorial.Basics) && <div className="text-left">
            Introduction to Remix's interface and concepts used in Ethereum, as well as the basics of Solidity.
          </div>}
          <label className="pb-1 float-left" style={{fontSize: "1rem"}}>Remix Basics</label>
        </button>
        <button className="btn border " onClick={() => setState((prevState) => {return { ...prevState, visibleTutorial: VisibleTutorial.Intermediate }})}>
          {(state.visibleTutorial === VisibleTutorial.Intermediate) && <div className="text-left">Using the web3.js to interact with a contract. Using Recorder tool.</div>}
          <label className="pb-1 float-left" style={{fontSize: "1rem"}}>Remix Intermediate</label>
        </button>
        <button className="btn border" onClick={() => setState((prevState) => {return { ...prevState, visibleTutorial: VisibleTutorial.Advanced }})}>
          {(state.visibleTutorial === VisibleTutorial.Advanced) && <div className="text-left">Learn the Proxy Pattern and working with Libraries in Remix. Learn to use the Debugger</div>}
          <label className="pb-1 float-left" style={{fontSize: "1rem"}}>Remix Advanced</label>
        </button>
      </div>
      <br/>
    </div>
  )
}

export default HomeTabLearn