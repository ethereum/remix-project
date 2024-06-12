/* eslint-disable no-unused-expressions */
import React, {useContext, useEffect, useRef, useState} from 'react' // eslint-disable-line
import DragBar from '../dragbar/dragbar'
import RemixUIPanelPlugin from '../plugins/panel-plugin'
import { PluginRecord } from '../types'
import { appPlatformTypes, platformContext } from '@remix-ui/app'
import './main-panel.css'

export type RemixUIMainPanelProps = {
  layout: any
}

const RemixUIMainPanel = (props: RemixUIMainPanelProps) => {
  const platform = useContext(platformContext)
  const { layout } = props
  const [plugins, setPlugins] = useState<PluginRecord[]>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const mainPanelRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const refs = [tabsRef, editorRef, mainPanelRef, terminalRef]

  const renderPanels = () => {
    if (layout.panels) {
      const pluginPanels: PluginRecord[] = []
      Object.values(layout.panels).map((panel: any) => {
        pluginPanels.push({
          profile: panel.plugin.profile,
          active: panel.active,
          view: panel.plugin.profile.name === 'tabs' ? panel.plugin.renderTabsbar() : panel.plugin.render(),
          class: panel.plugin.profile.name + '-wrap ' + (panel.minimized ? 'minimized ' : ' ') + ((platform === appPlatformTypes.desktop)? 'desktop' : ''),
          minimized: panel.minimized,
          pinned: panel.pinned
        })
      })
      setPlugins(pluginPanels)
    }
  }

  useEffect(() => {
    renderPanels()
    layout.event.on('change', () => {
      renderPanels()
    })

    return () => {
      layout.event.off('change')
    }
  }, [])

  const showTerminal = (hide: boolean) => {
    layout.panels.terminal.minimized = hide
    layout.event.emit('change', layout.panels)
    layout.emit('change', layout.panels)
  }

  const resize = (height: number) => {
    layout.emit('resize', height)
  }

  return (
    <div className="mainview">
      {Object.values(plugins).map((pluginRecord, i) => {
        return (
          <React.Fragment key={`mainView${i}`}>
            {pluginRecord.profile.name === 'terminal' ? (
              <DragBar key="dragbar-terminal" onResize={resize} hidden={pluginRecord.minimized || false} setHideStatus={showTerminal} refObject={terminalRef}></DragBar>
            ) : null}
            <RemixUIPanelPlugin ref={refs[i]} key={pluginRecord.profile.name} pluginRecord={pluginRecord} />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default RemixUIMainPanel
