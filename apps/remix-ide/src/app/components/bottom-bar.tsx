import React, { useState, useEffect } from 'react'
import { Plugin } from '@remixproject/engine'
import './styles/bottom-bar.css'

interface BottomBarProps {
  plugin: Plugin
}

export const BottomBar = ({ plugin }: BottomBarProps) => {
  const [explaining, setExplaining] = useState(false)
  const [aiSwitch, setAiSwitch] = useState(true)
  const [currentExt, setCurrentExt] = useState('')

  useEffect(() => {
    const getAI = async () => {
      try {
        const initState = await plugin.call('settings', 'getCopilotSetting')
        setAiSwitch(initState ?? true)
      } catch (err) {
        console.error('Failed to get copilot setting', err)
      }
    }

    const getCurrentExt = async () => {
      try {
        const path = await plugin.call('fileManager', 'getCurrentFile')
        const ext = path?.split('.').pop()?.toLowerCase() || ''
        setCurrentExt(ext)
        console.log("Current ext updated:", ext)
      } catch (err) {
        console.error('Failed to get current file', err)
        setCurrentExt('')
      }
    }

    getAI()
    getCurrentExt()

    plugin.on('fileManager', 'currentFileChanged', getCurrentExt)

    return () => {
      plugin.off('fileManager', 'currentFileChanged')
    }

  }, [plugin])

  const handleExplain = async () => {
    setExplaining(true)
    try {
      const path = await plugin.call('fileManager', 'getCurrentFile')
      const content = await plugin.call('fileManager', 'readFile', path)
  
      // await plugin.call('sidePanel', 'showContent', 'remixaiassistant')
      await plugin.call('remixAI', 'chatPipe', 'code_explaining', content)
      console.log("Explain sent to remixAI")
  
    } catch (err) {
      console.error("Explain failed:", err)
    }
    setExplaining(false)
  }

  const toggleAI = async () => {
    try {
      await plugin.call('settings', 'updateCopilotChoice', !aiSwitch)
      setAiSwitch(!aiSwitch)
      console.log("AI switch toggled:", !aiSwitch)
    } catch (err) {
      console.error('Failed to toggle AI copilot', err)
    }
  }

  const getExplainLabel = () => {
    if (['sol', 'vy', 'circom'].includes(currentExt)) return 'Explain contract'
    if (['js', 'ts'].includes(currentExt)) return 'Explain script'
    return ''
  }

  return (
    <div className="bottom-bar">
      {getExplainLabel() && (
        <button 
          className="explain-btn"
          onClick={handleExplain}
          disabled={explaining}
        >
          <img src="assets/img/remixAI_small.svg" alt="Remix AI" className="explain-icon" />
          <span>{getExplainLabel()}</span>
        </button>
      )}
      <div className="copilot-toggle">
        <span className={aiSwitch ? "on" : ""}>AI copilot</span>
        <label className="switch">
          <input type="checkbox" checked={aiSwitch} onChange={toggleAI} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  )
}

export default BottomBar
