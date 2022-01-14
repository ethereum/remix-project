/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { ThemeContext } from '../themeContext'

interface PluginButtonProps {
  imgPath: string,
  envID: string,
  envText: string,
  callback: any,
  l2?: boolean
}

function PluginButton ({ imgPath, envID, envText, callback, l2 }: PluginButtonProps) {
  const themeFilter = useContext(ThemeContext)

  return (
    <div>
      <button
        className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center remixui_home_envButton"
        data-id={'landingPageStart' + envText}
        onClick={() => callback()}
      >
        <img className="m-2 align-self-center remixui_home_envLogo" id={envID} src={imgPath} alt="" style={ { filter: themeFilter.filter } } />
        <label className="text-uppercase text-dark remixui_home_cursorStyle">{envText}</label>
      </button>
      { l2 && <label className="bg-light mx-1 px-1 mb-0 mx-2 position-relative remixui_home_l2Label">L2</label> }

    </div>
  )
}

export default PluginButton
