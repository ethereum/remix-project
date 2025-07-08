/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer, useEffect, useContext } from 'react'
import { ThemeContext } from '../themeContext'
const _paq = (window._paq = window._paq || []) // eslint-disable-line

interface HomeTabFileProps {
  plugin: any
}

function HomeTabFile({ plugin }: HomeTabFileProps) {
  const [state, setState] = useState<{
    recentWorkspaces: Array<string>
  }>({
    recentWorkspaces: [],
  })
  const [loadingWorkspace, setLoadingWorkspace] = useState<string>(null)
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', async () => {
      let recents = JSON.parse(localStorage.getItem('recentWorkspaces'))

      if (!recents) {
        recents = []
      } else {
        const filtered = recents.filter((workspace) => {
          return workspace !== null
        })
        setState((prevState) => {
          return { ...prevState, recentWorkspaces: filtered.slice(0, filtered.length <= 3 ? filtered.length : 3) }
        })
      }
    })

    const deleteSavedWorkspace = (name) => {
      const recents = JSON.parse(localStorage.getItem('recentWorkspaces'))
      let newRecents = recents
      if (!recents) {
        newRecents = []
      } else {
        newRecents = recents.filter((el) => {
          return el !== name
        })
        localStorage.setItem('recentWorkspaces', JSON.stringify(newRecents))
      }
      setState((prevState) => {
        return { ...prevState, recentWorkspaces: newRecents.slice(0, newRecents.length <= 3 ? newRecents.length : 3) }
      })
    }
    plugin.on('filePanel', 'workspaceDeleted', async (deletedName) => {
      deleteSavedWorkspace(deletedName)
    })
    return () => {
      try {
        plugin.off('filePanel', 'setWorkspace')
        plugin.off('filePanel', 'workspaceDeleted')
      } catch (e) {}
    }
  }, [plugin])

  const handleSwitchToRecentWorkspace = async (e, workspaceName) => {
    e.preventDefault()
    setLoadingWorkspace(workspaceName)
    plugin.call('sidePanel', 'showContent', 'filePanel')
    plugin.verticalIcons.select('filePanel')
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'loadRecentWorkspace'])
    await plugin.call('filePanel', 'switchToWorkspace', { name: workspaceName, isLocalhost: false })
    const workspaceFiles = await plugin.call('fileManager', 'readdir', '/')

    if (workspaceFiles['contracts'] && workspaceFiles['contracts'].isDirectory) {
      const contractFiles = await plugin.call('fileManager', 'readdir', '/contracts')
      const contractFilesArray = Object.keys(contractFiles)
      const contractFile = contractFilesArray[0]

      !contractFiles[contractFile].isDirectory && await plugin.call('fileManager', 'open', contractFile)
    } else if (workspaceFiles['circuits'] && workspaceFiles['circuits'].isDirectory) {
      const circuitFiles = await plugin.call('fileManager', 'readdir', '/circuits')
      const circuitFilesArray = Object.keys(circuitFiles)
      const circuitFile = circuitFilesArray[0]

      !circuitFiles[circuitFile].isDirectory && await plugin.call('fileManager', 'open', circuitFile)
    } else if (workspaceFiles['src'] && workspaceFiles['src'].isDirectory) {
      const srcFiles = await plugin.call('fileManager', 'readdir', '/src')
      const srcFilesArray = Object.keys(srcFiles)
      const srcFile = srcFilesArray[0]

      !srcFiles[srcFile].isDirectory && await plugin.call('fileManager', 'open', srcFile)
    } else if (workspaceFiles['README.txt'] && !workspaceFiles['README.txt'].isDirectory) {
      await plugin.call('fileManager', 'open', '/README.txt')
    } else if (workspaceFiles['README.md'] && !workspaceFiles['README.md'].isDirectory) {
      await plugin.call('fileManager', 'open', '/README.md')
    }
    setLoadingWorkspace(null)
  }

  return (
    <div className="justify-content-start d-flex flex-column mt-5" id="hTFileSection">
      {(state.recentWorkspaces[0] || state.recentWorkspaces[1] || state.recentWorkspaces[2]) && (
        <div className="d-flex flex-column mb-5 remixui_recentworkspace">
          <label style={{ fontSize: '1rem', color: isDark ? 'white' : 'black' }} className="mt-1 mb-3">
                Recent Workspaces
          </label>
          <div className="d-flex flex-column pl-2">
            {
              Array.isArray(state.recentWorkspaces) && state.recentWorkspaces.map((workspace, index) => {
                return index < 3 ? (
                  <a className="cursor-pointer mb-1 text-decoration-none" href="#" onClick={(e) => handleSwitchToRecentWorkspace(e, workspace)} key={index}>
                    { loadingWorkspace === workspace ? <i className="fad fa-spinner fa-spin mr-2"></i> : <i className="fas fa-folder-tree mr-2"></i> }
                    <span style={{ color: isDark ? 'white' : 'black' }}>{workspace}</span>
                  </a>
                ) : null
              })
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeTabFile
