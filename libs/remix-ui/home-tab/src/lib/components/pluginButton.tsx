/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { ThemeContext } from '../themeContext'
import { OverlayTrigger, Tooltip } from 'react-bootstrap' // eslint-disable-line
interface PluginButtonProps {
  imgPath: string,
  envID: string,
  envText: string,
  callback: any,
  l2?: boolean,
  description: string,
  remixMaintained?: boolean
}

function PluginButton ({ imgPath, envID, envText, callback, l2, description, remixMaintained }: PluginButtonProps) {
  const themeFilter = useContext(ThemeContext)

  return (
    <div>
      <button
        className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center align-items-center remixui_home_envButton"
        data-id={'landingPageStart' + envText}
        onClick={() => callback()}
      >
        <img className="px-2 m-2 align-self-center remixui_home_envLogo" id={envID} src={imgPath} alt="" style={ { filter: themeFilter.filter } } />
        <div className="h-100 d-flex flex-column">
          <label className="text-uppercase text-dark remixui_home_cursorStyle">{envText}</label>
          <div className="remixui_home_envLogoDescription">{description}</div>
        </div>
      </button>
      { l2 && <label className="bg-light mx-1 px-1 mb-0 mx-2 position-relative remixui_home_l2Label">L2</label> }
      { remixMaintained &&
          <OverlayTrigger placement="bottom" overlay={
            <Tooltip id="overlay-tooltip-run-script">
              <span>Maintained by Remix</span>
            </Tooltip>
          }>
            <i className="bg-light text-success mx-1 px-1 mb-0 mx-2 position-relative remixui_home_maintainedLabel fas fa-check"></i>
          </OverlayTrigger>
      }

    </div>
  )
}

export default PluginButton
