/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import VerticalIconsContextMenu from '../vertical-icons-context-menu'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Fragment, SyntheticEvent, useEffect, useReducer, useRef, useState } from 'react'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// import * as helper from '../../../../../../apps/remix-ide/src/lib/helper'
import { defaultState, iconStatusReducer } from '../reducers/iconReducers'

  interface IconProps {
    verticalIconPlugin: VerticalIcons
    profile: any
    contextMenuAction: (evt: any, profileName: string, documentation: string) => void
    addActive: (profileName: string) => void
    removeActive: () => void
  }

function Icon ({
  profile,
  verticalIconPlugin,
  contextMenuAction,
  addActive,
  removeActive
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
  // @ts-ignore
  const [pageX, setPageX] = useState<number>(null)
  // @ts-ignore
  const [pageY, setPageY] = useState<number>(null)
  const [showContext, setShowContext] = useState(false)
  const [canDeactivate] = useState(false)
  const iconRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, dispatchIconStatus] = useReducer(iconStatusReducer, defaultState)

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

  /**
   * Set a new status for the @arg name
   * keys = ['succeed', 'edited', 'none', 'loading', 'failed']
   * types = ['error', 'warning', 'success', 'info', '']
   * @param {String} name
   * @param {Object} status
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // function setIconStatus (name: string, status: any) {
  //   if (!iconRef.current) return
  //   const statusEl = iconRef.current.querySelector('i')
  //   if (statusEl) {
  //     iconRef.current.removeChild(statusEl) // need to eject component instead of removing?
  //   }
  //   if (status.key === 'none') return // remove status

  //   let text = ''
  //   let key = ''
  //   if (typeof status.key === 'number') {
  //     key = status.key.toString()
  //     text = key
  //   } else key = helper.checkSpecialChars(status.key) ? '' : status.key

  //   let type = ''
  //   if (status.type === 'error') {
  //     type = 'danger' // to use with bootstrap
  //   } else type = helper.checkSpecialChars(status.type) ? '' : status.type
  //   const title = helper.checkSpecialChars(status.title) ? '' : status.title

  //   const icon = document.createElement('i')
  //   icon.title = title
  //   // icon.className = resolveClasses(key, type)
  //   icon.ariaHidden = 'true'
  //   const innerText = document.createTextNode(text)
  //   icon.appendChild(innerText)
  //   iconRef.current!.appendChild(icon)
  //   iconRef.current.classList.add('remixui_icon')
  // }

  useEffect(() => {
    console.log('profile.name: ', profile.name)
    verticalIconPlugin.on(profile.name, 'statusChanged', () => {
      console.log('caught statusChanged in react! icon.tsx')
    })
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
        onBlur={closeContextMenu}
        data-id={`verticalIconsKind${name}`}
        id={`verticalIconsKind${name}`}
        ref={iconRef}
      >
        <img className="remixui_image" src={icon} alt={name} />
      </div>
      {/* { status && status.profileName.length
        ? <i
          title={status.title}
          className={resolveClasses(status.key as string, status.type)}
          aria-hidden="true"
        >
          {status.text}
        </i> : null
      } */}
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
