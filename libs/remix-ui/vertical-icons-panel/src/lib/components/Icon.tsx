import VerticalIconsContextMenu from '../vertical-icons-context-menu'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, SyntheticEvent, useEffect, useReducer, useRef, useState } from 'react'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import Badge from './Badge'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'

export interface IconStatus {
    key: string
    title: string
    type: string
    pluginName?: string
  }

export interface BadgeStatus extends IconStatus {
    text: string
  }

export interface IconProfile {
    description: string
    displayName: string
    documentation: string
    events: any[]
    icon: string
    kind: string
    location: string
    methods: string[]
    name: string
    version: string
    tooltip?: string
  }

  interface IconProps {
    verticalIconPlugin: VerticalIcons
    profile: IconProfile
    contextMenuAction: (evt: any, profileName: string, documentation: string) => void
    addActive: (profileName: string) => void
    removeActive: () => void
  }

const initialState = {
  text: '',
  key: '',
  title: '',
  type: '',
  pluginName: ''
}

function Icon ({
  profile,
  verticalIconPlugin,
  contextMenuAction,
  addActive,
  removeActive
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}: IconProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tooltip, displayName, name, kind, icon, documentation } = profile
  const [title] = useState(() => {
    const temp = tooltip || displayName || name
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const handleContextMenu = (e: SyntheticEvent & PointerEvent) => {
    const deactivationState = verticalIconPlugin.appManager
      .canDeactivatePlugin(verticalIconPlugin.defaultProfile, { name })
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
    <Fragment>
      <div
        className={name === 'pluginManager' ? 'remixui_icon ml-2 mt-2 mr-2 mb-0 pl-1' : 'remixui_icon m-2 pl-1'}
        onLoad={() => {
          if (name === 'filePanel') {
            addActive(name)
          }
        }}
        onClick={() => {
          removeActive()
          addActive(name)
          verticalIconPlugin.toggle(name)
        }}
        // @ts-ignore
        plugin={name}
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
        <img className="remixui_image" src={icon} alt={name} />
        { badgeStatus && badgeStatus.pluginName === name ? (
          <Badge
            badgeStatus={badgeStatus}
          />) : null }
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
    </Fragment>
  )
}

export default Icon
