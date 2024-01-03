import { CustomTooltip } from "@remix-ui/helper"
import React, { MouseEventHandler, useContext, useEffect, useState } from "react"

interface ElectronWorkspaceNameProps {
  path: string
  plugin: any
}

export const ElectronWorkspaceName = (props: ElectronWorkspaceNameProps) => {
  const { path } = props
  
  const parsePath = (path: string) => {
    const pathArray = path.split('/')
    return pathArray[pathArray.length - 1]
  }

  const openInExplorer = () => {
    props.plugin.call('fs', 'revealInExplorer', {
      path
    })
  }

  return (
    (path === undefined || path === '') ? <></> :
      <div className="d-flex align-items-baseline">
        <CustomTooltip
          placement="top"
          tooltipId="workspace-name"
          tooltipClasses="text-nowrap"
          tooltipText={path}
        >
          <div>{parsePath(path)}</div>
        </CustomTooltip>
        <CustomTooltip
          placement="top"
          tooltipId="workspace-open-in-explorer"
          tooltipClasses="text-nowrap"
          tooltipText='Open in file explorer'
        >
          <i onClick={openInExplorer} style={{ cursor: 'pointer' }} className="fa fas fa-arrow-up-right-from-square ml-2"></i>
        </CustomTooltip>
      </div>

  )
}
