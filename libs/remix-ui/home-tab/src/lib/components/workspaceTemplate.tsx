/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
interface WorkspaceTemplateProps {
  gsID: string,
  workspaceTitle: string,
  callback: any,
  description: string,
}

function WorkspaceTemplate ({ gsID, workspaceTitle, description, callback }: WorkspaceTemplateProps) {

  return (
    <div className="d-flex remixui_home_workspaceTemplate">
      <button
        className="btn border-secondary p-1 d-flex flex-column  text-nowrap justify-content-center align-items-center mr-2 remixui_home_workspaceTemplate"
        data-id={'landingPageStart' + gsID}
        onClick={() => callback()}
      >
        <div className="w-100 p-2 h-100 align-items-start d-flex flex-column">
          <label className="h6 pb-2 text-uppercase text-dark remixui_home_cursorStyle">{workspaceTitle}</label>
          <div className="remixui_home_gtDescription">{description}</div>
        </div>
      </button>
    </div>
  )
}

export default WorkspaceTemplate
