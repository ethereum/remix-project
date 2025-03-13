import React, { Fragment, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Plugin } from '@remixproject/engine'
import './remix-ui-vertical-icons-panel.css'
import IconList from './components/IconList'
import Home from './components/Home'
import { verticalScrollReducer } from './reducers/verticalScrollReducer'
import { Chevron } from './components/Chevron'
import { IconRecord } from './types'
import { onLineContext } from '@remix-ui/app'
import { CustomTooltip } from '@remix-ui/helper'
import { Registry } from '@remix-project/remix-lib'

export interface RemixUiVerticalIconsPanelProps {
  verticalIconsPlugin: Plugin
  icons: IconRecord[]
}

const initialState = {
  scrollHeight: 0,
  clientHeight: 0,
  scrollState: false
}

const RemixUiVerticalIconsPanel = ({ verticalIconsPlugin, icons }: RemixUiVerticalIconsPanelProps) => {
  const scrollableRef = useRef<any>()
  const iconPanelRef = useRef<any>()
  const [activateScroll, dispatchScrollAction] = useReducer(verticalScrollReducer, initialState)
  const [theme, setTheme] = useState<string>('dark')
  const [isPanelHovered, setIsPanelHovered] = useState<boolean>(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const online = useContext(onLineContext)

  const evaluateScrollability = () => {
    dispatchScrollAction({
      type: 'resize',
      payload: {
        scrollHeight: scrollableRef.current?.scrollHeight,
        clientHeight: scrollableRef.current?.clientHeight,
        scrollState: false
      }
    })
  }

  useEffect(() => {
    window.addEventListener('resize', evaluateScrollability)
    evaluateScrollability()
    return () => {
      window.removeEventListener('resize', evaluateScrollability)
    }
  }, [])

  useEffect(() => {
    evaluateScrollability()
  }, [icons, theme])

  useEffect(() => {
    verticalIconsPlugin.call('theme', 'currentTheme').then((th: any) => {
      setTheme(th.quality)
    })
    verticalIconsPlugin.on('theme', 'themeChanged', (th: any) => {
      setTheme(th.quality)
    })
    return () => {
      verticalIconsPlugin.off('theme', 'themeChanged')
    }
  }, [])

  async function itemContextAction(e: any, name: string, documentation: string) {
    verticalIconsPlugin.call('manager', 'deactivatePlugin', name)
  }

  const handlePanelMouseEnter = (e: React.MouseEvent) => {
    const rect = iconPanelRef.current.getBoundingClientRect()
    setTooltipPosition({ top: rect.top, left: rect.right + 10 })
    setIsPanelHovered(true)
  }

  const handlePanelMouseLeave = () => {
    setIsPanelHovered(false)
  }

  const renderAllPluginNames = () => {
    return (
      <div className="remixui_plugin-names-tooltip">
        <h6 className="mb-2">Plugins</h6>
        <ul className="list-unstyled mb-0">
          {icons.map((icon) => (
            <li key={icon.profile.name} className="mb-1 d-flex justify-content-between align-items-center">
              <span>{icon.profile.displayName || icon.profile.name}</span>
              {icon.active && (
                <button
                  className="btn btn-sm btn-secondary pl-2 pr-2 py-0 ml-2"
                  style={{ fontSize: '0.7rem' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeOtherPlugins(icon.profile.name)
                  }}
                >
                  Close Others
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 text-muted small">
          <em>Click any icon to open a plugin</em>
          <br />
          <em>Use "Close Others" to keep only that plugin open</em>
        </div>
      </div>
    )
  }

  const closeOtherPlugins = (exceptName: string) => {
    icons.forEach((icon) => {
      if (icon.profile.name !== exceptName && icon.active) {
        verticalIconsPlugin.call('manager', 'togglePlugin', icon.profile.name)
      }
    })
  }

  return (
    <div id="iconsP" className="h-100">
      <div
        className="remixui_icons d-flex flex-column remixui_icons_height"
        ref={iconPanelRef}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
      >
        <Home verticalIconPlugin={verticalIconsPlugin} />
        <div
          className={
            scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
              ? 'remixui_default-icons-container remixui_requiredSection'
              : activateScroll && activateScroll.scrollState
                ? 'remixui_default-icons-container remixui_requiredSection'
                : 'remixui_requiredSection'
          }
        >
          <IconList
            theme={theme}
            icons={icons.filter((p) => p.isRequired && p.profile.name !== 'pluginManager')}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
          {scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight ? (
            <Chevron direction="up" divElementRef={scrollableRef} cssRule={'fa fa-chevron-up remixui_icon-chevron my-0'} />
          ) : null}
        </div>
        <div
          id="remixuiScrollable"
          className={
            scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
              ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'
              : activateScroll && activateScroll.scrollState
                ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'
                : 'remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'
          }
          ref={scrollableRef}
        >
          <IconList
            theme={theme}
            icons={icons.filter((p) => {
              return !p.isRequired && p.profile.name !== 'settings'
            })}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
        </div>
        <div className="remixui_default-icons-container border-0">
          { scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight ? (
            <Chevron divElementRef={scrollableRef} direction="down" cssRule={'fa fa-chevron-down remixui_icon-chevron my-0'} />
          ) : null }
          <IconList
            theme={theme}
            icons={icons.filter((p) => p.profile.name === 'settings' || p.profile.name === 'pluginManager')}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
          { Registry.getInstance().get('platform').api.isDesktop() ? (
            online ? (
              <CustomTooltip
                placement="top"
                tooltipText={'You are online'}
              >
                <i className="fa-solid fa-wifi text-success p-2"></i>
              </CustomTooltip>)
              :
              (<CustomTooltip
                placement="top"
                tooltipText={'You are offline'}
              >
                <i className="fa-solid fa-wifi-exclamation text-danger p-2"></i>
              </CustomTooltip>)
          ) : null }
        </div>
      </div>
      {isPanelHovered && (
        <div
          className="position-fixed remixui_plugins-list-tooltip"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 1000,
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f9fa',
            color: theme === 'dark' ? '#f8f9fa' : '#212529',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            padding: '8px 12px',
            borderRadius: '4px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {renderAllPluginNames()}
        </div>
      )}
    </div>
  )
}

export default RemixUiVerticalIconsPanel
