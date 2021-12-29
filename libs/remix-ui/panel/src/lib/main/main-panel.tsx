import AppContext from 'libs/remix-ui/app/src/lib/remix-app/context/context'
import { editor } from 'monaco-editor'
import React, { useContext, useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from '../types'
import './main-panel.css'

const RemixUIMainPanel = () => {
  const appContext = useContext(AppContext)
  const tabsRef = useRef<HTMLDivElement>(null)
  const mainPanelRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    console.log(appContext)
    if(appContext) {
      console.log(appContext)
      tabsRef.current.appendChild(appContext.panels.tabs.renderTabsbar())
      editorRef.current.appendChild(appContext.panels.editor.render())
      mainPanelRef.current.appendChild(appContext.panels.main.render())
      terminalRef.current.appendChild(appContext.panels.terminal.render())
      console.log(appContext.panels.main.render())

      const plugins: PluginRecord[] = [
        {
          profile: appContext.panels.tabs.profile,
          active: true,
          view: appContext.panels.tabs.renderTabsbar()
        }
      ]
    }
  }, [])

  const components = {
    tabs: <div ref={tabsRef}></div>,
    editor: <div ref={editorRef}></div>,
    main: <div ref={mainPanelRef}></div>,
    terminal: <div ref={terminalRef}></div>
  }



  return (<div className='mainview'>
    { components.tabs }
    { components.editor }
    { components.main }
    { components.terminal }
  </div>)
}

export default RemixUIMainPanel
