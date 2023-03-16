/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { ThemeContext } from '../themeContext'
import { CustomTooltip } from '@remix-ui/helper'
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
    <div className="d-flex remixui_home_envButton">
      <button
        className="btn border-secondary d-flex flex-column  pb-2 text-nowrap justify-content-center align-items-center mr-2 remixui_home_envButton"
        data-id={'landingPageStart' + envText}
        onClick={() => callback()}
      >
        <img className="px-2 mb-2 align-self-center remixui_home_envLogo" id={envID} src={imgPath} alt="" style={ { filter: themeFilter.filter } } />
        <div className="mb-2 h-100 d-flex flex-column">
          <label className="text-uppercase text-dark remixui_home_cursorStyle">{envText}</label>
          <div className="remixui_home_envLogoDescription">{description}</div>
        </div>
      </button>
      { l2 && <label className="bg-light mx-1 px-1 mb-0 mx-2 position-absolute remixui_home_l2Label">L2</label> }
      { remixMaintained &&
        <CustomTooltip
          placement="bottom"
          tooltipId="overlay-tooltip-by-remix"
          tooltipText={'Maintained by Remix'}
        >
          <i className="bg-light text-success mx-1 px-1 mb-0 mx-2 position-absolute remixui_home_maintainedLabel fas fa-check"></i>
        </CustomTooltip>
      }

    </div>
  )
}

export default PluginButton
