/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { ThemeContext } from '../themeContext'

interface WorkspaceTemplateProps {
  gsID: string
  workspaceTitle: string
  projectLogo: string
  callback: any
  description: string
}

function WorkspaceTemplate({ gsID, workspaceTitle, description, projectLogo, callback }: WorkspaceTemplateProps) {
  const themeFilter = useContext(ThemeContext)

  return (
    <div className="d-flex remixui_home_workspaceTemplate">
      <button
        className="btn border-secondary p-1 d-flex flex-column  text-nowrap justify-content-center mr-2 remixui_home_workspaceTemplate"
        data-id={'landingPageStart' + gsID}
        onClick={() => callback()}
      >
        <div className="w-100 p-1 h-100 align-items-center d-flex flex-column">
          <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="etherscan-receipt-proxy-status" tooltipText={description}>
            <div className='d-flex flex-column align-items-center'>
              <label className="h5 pb-1 mt-1 text-uppercase remixui_home_cursorStyle" style={{ color: themeFilter.name == "dark" ? "var(--white)" : "var(--black)" }}>{workspaceTitle}</label>
              <img className="" src={projectLogo} alt="" style={{ height: "20px", filter: themeFilter.name == "dark" ? "invert(1)" : "invert(0)" }} />
            </div>
          </CustomTooltip>
        </div>
      </button>
    </div>
  )
}

export default WorkspaceTemplate
