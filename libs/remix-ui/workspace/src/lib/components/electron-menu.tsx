import React, { MouseEventHandler, useContext, useEffect, useState } from "react"
import { FileSystemContext } from "../contexts"
import { appPlatformTypes, platformContext } from '@remix-ui/app'
import { FormattedMessage } from "react-intl"
import '../css/electron-menu.css'
import { CustomTooltip } from '@remix-ui/helper'

export const ElectronMenu = (props: {
  clone: () => void,
  createWorkspace: () => void,
 }) => {
  const platform = useContext(platformContext)
  const global = useContext(FileSystemContext)

  useEffect(() => {
    if (platform === appPlatformTypes.desktop) {
      global.dispatchGetElectronRecentFolders()
    }
  }, [])

  const openFolderElectron = async (path: string) => {
    global.dispatchOpenElectronFolder(path)
  }

  const lastFolderName = (path: string) => {
    const pathArray = path.split('/')
    return pathArray[pathArray.length - 1]
  }

  return (
    (platform !== appPlatformTypes.desktop) ? null :
      (global.fs.browser.isSuccessfulWorkspace ? null :
        <>
          <div data-id="openFolderButton" onClick={async () => { await openFolderElectron(null) }} className='btn btn-primary mb-1'><FormattedMessage id="electron.openFolder" /></div>
          <div data-id="createWorkspaceButton" onClick={async () => { await props.createWorkspace() }} className='btn btn-primary mb-1'><FormattedMessage id="electron.createProject" /></div>
          <div data-id="cloneFromGitButton" onClick={async () => { props.clone() }} className='btn btn-primary'><FormattedMessage id="electron.gitClone" /></div>

          {global.fs.browser.recentFolders.length > 0 ?
            <>
              <label className="py-2 pt-3 align-self-center m-0">
                <FormattedMessage id="electron.recentFolders" />
              </label>
              <ul>
                {global.fs.browser.recentFolders.map((folder, index) => {
                  return <li key={index}>
                    <CustomTooltip
                      tooltipText={folder}
                      tooltipId={`electron-recent-folder-${index}`}
                      placement='bottom'
                    >
                      <div className="recentfolder pb-1">
                        <span onClick={async () => { await openFolderElectron(folder) }} className="pl-2 recentfolder_name pr-2">{lastFolderName(folder)}</span>
                        <span onClick={async () => { await openFolderElectron(folder) }} data-id={`recent_folder_${folder}`} className="recentfolder_path pr-2">{folder}</span>
                        <i
                          onClick={() => {
                            global.dispatchRemoveRecentFolder(folder)
                          }}
                          className="fas fa-times recentfolder_delete pr-2"
                        >

                        </i>
                      </div>
                    </CustomTooltip>
                  </li>
                })}
              </ul>
            </>
            : null}
        </>
      )
  )
}