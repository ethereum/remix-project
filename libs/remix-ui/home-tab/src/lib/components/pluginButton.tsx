/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { ThemeContext } from '../themeContext'

interface PluginButtonProps {
  imgPath: string,
  envID: string,
  envText: string,
  callback: any
}

function PluginButton ({ imgPath, envID, envText, callback }: PluginButtonProps) {
  const themeFilter = useContext(ThemeContext)

  return (
    <button
      className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center remixui_envButton"
      data-id={'landingPageStart' + envText}
      onClick={() => callback()}
    >
      <img className="m-2 align-self-center remixui_envLogo" id={envID} src={imgPath} alt="" style={ { filter: themeFilter.filter } } />
      <label className="text-uppercase text-dark remixui_cursorStyle">{envText}</label>
    </button>
  )
}

export default PluginButton
