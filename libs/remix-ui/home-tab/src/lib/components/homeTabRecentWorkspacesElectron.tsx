/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer, useEffect } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
const _paq = (window._paq = window._paq || []) // eslint-disable-line

interface HomeTabFileProps {
  plugin: any
}

function HomeTabRecentWorkspacesElectron({ plugin }: HomeTabFileProps) {
  const [state, setState] = useState<{
    recentFolders: Array<string>
  }>({
    recentFolders: [],
  })
  const [loadingWorkspace, setLoadingWorkspace] = useState<string>(null)
  const [showAll, setShowAll] = useState<boolean>(false)

  useEffect(() => {
    const loadRecentFolders = async () => {
      try {
        const recentFolders = await plugin.call('fs', 'getRecentFolders')
        setState(prevState => ({
          ...prevState,
          recentFolders: recentFolders || []
        }))
      } catch (error) {
        console.error('Error loading recent folders:', error)
      }
    }

    loadRecentFolders()
  }, [plugin])

  const handleOpenRecentWorkspace = async (folderPath: string) => {
    try {
      setLoadingWorkspace(folderPath)
      _paq.push(['trackEvent', 'hometab', 'recentWorkspacesElectron', 'loadRecentWorkspace'])
      await plugin.call('fs', 'openFolderInSameWindow', folderPath)
    } catch (error) {
      console.error('Error opening recent workspace:', error)
    } finally {
      setLoadingWorkspace(null)
    }
  }

  const handleOpenInNewWindow = async (folderPath: string) => {
    try {
      _paq.push(['trackEvent', 'hometab', 'recentWorkspacesElectron', 'openInNewWindow'])
      await plugin.call('fs', 'openFolder', folderPath)
    } catch (error) {
      console.error('Error opening folder in new window:', error)
    }
  }

  const handleRevealInExplorer = async (folderPath: string) => {
    try {
      _paq.push(['trackEvent', 'hometab', 'recentWorkspacesElectron', 'revealInExplorer'])
      await plugin.call('fs', 'revealInExplorer', { path: [folderPath] }, true)
    } catch (error) {
      console.error('Error revealing folder in explorer:', error)
    }
  }

  const handleRemoveFromRecents = async (folderPath: string) => {
    try {
      await plugin.call('fs', 'removeRecentFolder', folderPath)
      setState(prevState => ({
        ...prevState,
        recentFolders: prevState.recentFolders.filter(folder => folder !== folderPath)
      }))
      _paq.push(['trackEvent', 'hometab', 'recentWorkspacesElectron', 'removeFromRecents'])
    } catch (error) {
      console.error('Error removing folder from recents:', error)
    }
  }

  const getWorkspaceName = (folderPath: string) => {
    return folderPath.split('/').pop() || folderPath
  }

  return (
    <div className="justify-content-start d-flex flex-column my-5" id="hTFileSection">
      <div className="d-flex flex-column mb-5 remixui_recentworkspace">
        <label style={{ fontSize: '1rem' }} className="mt-1 mb-3">
          Recent Projects
        </label>
        <div className="d-flex flex-column ps-2">
          <div className={showAll ? "overflow-auto" : ""} style={{ maxHeight: showAll ? '300px' : 'auto' }}>
            {
              Array.isArray(state.recentFolders) && state.recentFolders.slice(0, showAll ? state.recentFolders.length : 3).map((folderPath: string, index) => {
              const workspaceName = getWorkspaceName(folderPath)

              return (
                <div key={index} className="d-flex flex-row align-items-center mb-2">
                  { loadingWorkspace === folderPath ? <i className="fad fa-spinner fa-spin me-2"></i> : <i className="fas fa-folder-tree me-2"></i> }
                  <div className="d-flex flex-row justify-content-between w-100 flex-wrap">
                    <a className="cursor-pointer text-decoration-none d-inline-block" href="#" onClick={(e) => {
                      e.preventDefault()
                      handleOpenRecentWorkspace(folderPath)
                    }}>
                      <span>{workspaceName}</span>
                    </a>
                    <div className="d-flex">
                      <CustomTooltip tooltipText="Open in new window" placement="top">
                        <i className="fas fa-clone me-2 cursor-pointer" onClick={() => handleOpenInNewWindow(folderPath)}></i>
                      </CustomTooltip>
                      <CustomTooltip tooltipText="Show in folder" placement="top">
                        <i className="fas fa-eye me-2 cursor-pointer" onClick={() => handleRevealInExplorer(folderPath)}></i>
                      </CustomTooltip>
                      <CustomTooltip tooltipText="Remove from recents" placement="top">
                        <i className="fas fa-times cursor-pointer me-2" onClick={() => handleRemoveFromRecents(folderPath)}></i>
                      </CustomTooltip>
                    </div>
                  </div>
                </div>
              )
            })
            }
          </div>
          
          {state.recentFolders && state.recentFolders.length > 3 && (
            <div className="text-center mt-2">
              <a 
                href="#" 
                className="text-decoration-none small" 
                onClick={(e) => {
                  e.preventDefault()
                  setShowAll(!showAll)
                }}
              >
                {showAll ? (
                  <>
                    <i className="fas fa-chevron-up me-1"></i>
                    Show less
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down me-1"></i>
                    Show more ({state.recentFolders.length - 3} more)
                  </>
                )}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeTabRecentWorkspacesElectron
