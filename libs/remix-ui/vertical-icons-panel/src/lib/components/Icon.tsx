import VerticalIconsContextMenu from '../vertical-icons-context-menu'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, SyntheticEvent, useEffect, useReducer, useRef, useState } from 'react'
import Badge from './Badge'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'
import { Plugin } from '@remixproject/engine'
import { IconRecord } from '../types'

export interface IconStatus {
    key: string
    title: string
    type: string
    pluginName?: string
  }

export interface BadgeStatus extends IconStatus {
    text: string
  }

  interface IconProps {
    verticalIconPlugin: Plugin
    iconRecord: IconRecord
    contextMenuAction: (evt: any, profileName: string, documentation: string) => void
    theme: string
  }

const initialState = {
  text: '',
  key: '',
  title: '',
  type: '',
  pluginName: ''
}

const Icon = ({
  iconRecord,
  verticalIconPlugin,
  contextMenuAction,
  theme
}: IconProps) => {
  const { displayName, name, icon, documentation } = iconRecord.profile
  const [title] = useState(() => {
    const temp = null || displayName || name
    return temp.replace(/^\w/, (word: string) => word.toUpperCase())
  })
  const [links, setLinks] = useState<{ Documentation: string, CanDeactivate: boolean }>(
      {} as { Documentation: string, CanDeactivate: boolean }
  )
  const [badgeStatus, dispatchStatusUpdate] = useReducer(iconBadgeReducer, initialState)
  // @ts-ignore
  const [pageX, setPageX] = useState<number>(null)
  // @ts-ignore
  const [pageY, setPageY] = useState<number>(null)
  const [showContext, setShowContext] = useState(false)
  const [canDeactivate] = useState(false)
  const iconRef = useRef<any>(null)

  const handleContextMenu = (e: SyntheticEvent & PointerEvent) => {
    const deactivationState = iconRecord.canbeDeactivated
    if (documentation && documentation.length > 0 && deactivationState) {
      setLinks({ Documentation: documentation, CanDeactivate: deactivationState })
    } else {
      setLinks({ Documentation: documentation, CanDeactivate: deactivationState })
    }
    setShowContext(false)
    setPageX(e.pageX)
    setPageY(e.pageY)
    setShowContext(true)
  }
  function closeContextMenu () {
    setShowContext(false)
  }

  useEffect(() => {
    verticalIconPlugin.on(name, 'statusChanged', (iconStatus: IconStatus) => {
      iconStatus.pluginName = name
      const action: IconBadgeReducerAction = { type: name, payload: { status: iconStatus, verticalIconPlugin: verticalIconPlugin } }
      dispatchStatusUpdate(action)
    })
    return () => {
      verticalIconPlugin.off(name, 'statusChanged')
    }
  }, [])

  return (
    <>
      <div
        className={`remixui_icon m-2  pt-1`}
        onClick={() => {
          (verticalIconPlugin as any).toggle(name)
        }}
        {...{plugin: name}}
        title={title}
        onContextMenu={(e: any) => {
          e.preventDefault()
          e.stopPropagation()
          handleContextMenu(e)
        }}
        data-id={`verticalIconsKind${name}`}
        id={`verticalIconsKind${name}`}
        ref={iconRef}
      >
        <img data-id={iconRecord.active ? `selected`: ''} className={`${theme === 'dark' ? 'invert' : ''} ${theme} remixui_image ${iconRecord.active ? `selected-${theme}`:''}`} src={icon} alt={name} />
          <Badge
            badgeStatus={badgeStatus}
          />
      </div>
      {showContext ? (
        <VerticalIconsContextMenu
          pageX={pageX}
          pageY={pageY}
          links={links}
          profileName={name}
          hideContextMenu={closeContextMenu}
          canBeDeactivated={canDeactivate}
          verticalIconPlugin={verticalIconPlugin}
          contextMenuAction={contextMenuAction}
        />
      ) : null}
    </>
  )
}

export default Icon
