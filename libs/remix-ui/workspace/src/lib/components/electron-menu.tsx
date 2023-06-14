import React, { MouseEventHandler, useContext, useEffect, useState } from "react"
import { FileSystemContext } from "../contexts"
import isElectron from 'is-electron'
import { FormattedMessage } from "react-intl"
import '../css/electron-menu.css'

export const ElectronMenu = () => {
  const global = useContext(FileSystemContext)

  useEffect(() => {
    if (isElectron()) {
      global.dispatchGetElectronRecentFolders()
    }
  }, [])

  useEffect(() => {
    if (isElectron()) {
      console.log('global.fs.browser.recentFolders', global.fs.browser.recentFolders)
    }
  }, [global.fs.browser.recentFolders])

  const openFolderElectron = async (path: string) => {
    console.log('open folder electron', path)
    global.dispatchOpenElectronFolder(path)
  }

  const lastFolderName = (path: string) => {
    const pathArray = path.split('/')
    return pathArray[pathArray.length - 1]
  }

  return (
    (isElectron() && global.fs.browser.isSuccessfulWorkspace ? null :
      <>
        <div onClick={async()=>{await openFolderElectron(null)}} className='btn btn-primary'><FormattedMessage id="electron.openFolder" /></div>
        {global.fs.browser.recentFolders.length > 0 ?
          <>
            <label className="py-2 pt-3 align-self-center m-0" style={{ fontSize: "1.2rem" }}>
              <FormattedMessage id="electron.recentFolders" />
            </label>
            <ul>
              {global.fs.browser.recentFolders.map((folder, index) => {
                return <li key={index}>
                  <div className="recentfolder pb-1">
                    <span onClick={async()=>{await openFolderElectron(folder)}} className="pl-2 recentfolder_name pr-2">{lastFolderName(folder)}</span>
                    <span onClick={async()=>{await openFolderElectron(folder)}} data-id={{folder}} className="recentfolder_path pr-2">{folder}</span>
                    <i
                      onClick={() => {

                      }}
                      className="fas fa-times recentfolder_delete pr-2"
                    >

                    </i>
                  </div>
                </li>
              })}
            </ul>
          </>
          : null}
      </>
    )
  )
}