/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import VerticalIconsContextMenu from '../vertical-icons-context-menu'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Fragment, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import * as helper from '../../../../../../apps/remix-ide/src/lib/helper'

  interface IconProps {
    verticalIconPlugin: VerticalIcons
    // kind: string
    // name: string
    // icon: string
    // displayName: string
    // tooltip: string
    // documentation: string
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
    return temp.replace(/^\w/, word => word.toUpperCase())
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
  const iconStatusValues = { title: '', key: '', type: '', text: '' }

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
   * resolve a classes list for @arg key
   * @param {String} key
   * @param {String} type
   */
  function resolveClasses (key: string, type: string) {
    let classes = 'remixui_status'

    switch (key) {
      case 'succeed':
        classes += ' fas fa-check-circle text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'edited':
        classes += ' fas fa-sync text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'loading':
        classes += ' fas fa-spinner text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'failed':
        classes += ' fas fa-exclamation-triangle text-' + type + ' ' + 'remixui_statusCheck'
        break
      default: {
        classes += ' badge badge-pill badge-' + type
      }
    }
    return classes
  }

  /**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function setIconStatus (name: string, status: { key: string | number, title: string, type: string }) {
    if (!iconRef.current) return
    const statusEl = iconRef.current.querySelector('i')
    if (statusEl) {
      iconRef.current.removeChild(statusEl)
    }
    if (status.key === 'none') return // remove status

    let text = ''
    let key = ''
    if (typeof status.key === 'number') {
      key = status.key.toString()
      text = key
    } else key = helper.checkSpecialChars(status.key) ? '' : status.key

    let type = ''
    if (status.type === 'error') {
      type = 'danger' // to use with bootstrap
    } else type = helper.checkSpecialChars(status.type) ? '' : status.type
    const title = helper.checkSpecialChars(status.title) ? '' : status.title

    const icon = document.createElement('i')
    icon.title = title
    icon.className = resolveClasses(key, type)
    icon.ariaHidden = 'true'
    const innerText = document.createTextNode(text)
    icon.appendChild(innerText)
    iconRef.current!.appendChild(icon)
    iconRef.current.classList.add('remixui_icon')
  }

  function listenOnStatus (profile: any) {
    function setErrorStatus (status: any) {
      if (!verticalIconPlugin.types.includes(status.type) && status.type) throw new Error(`type should be ${verticalIconPlugin.keys.join()}`)
      if (status.key === undefined) throw new Error('status key should be defined')
      if (typeof status.key === 'string' && (!verticalIconPlugin.keys.includes(status.key))) {
        throw new Error('key should contain either number or ' + verticalIconPlugin.keys.join())
      }
      setIconStatus(profile.name, status)
    }
    verticalIconPlugin.iconStatus[profile.name] = setErrorStatus
    verticalIconPlugin.on(profile.name, 'statusChanged', verticalIconPlugin.iconStatus[profile.name])
  }

  useEffect(() => {
    listenOnStatus(profile)
    return () => {
      console.log('just listened for status change ', { profile })
      addEventListener('statusChanged', (e) => {
        console.log('statusChanged just happend for this icon and this is its payload ', e)
      })
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
        onBlur={closeContextMenu}
        data-id={`verticalIconsKind${name}`}
        id={`verticalIconsKind${name}`}
        ref={iconRef}
      >
        <img className="remixui_image" src={icon} alt={name} />
      </div>
      {verticalIconPlugin.iconStatus && Object.keys(verticalIconPlugin.iconStatus).length !== null ? (
        <i
          title={iconStatusValues.title}
          className={resolveClasses(iconStatusValues.key, iconStatusValues.type)}
          aria-hidden="true"
        >
          {iconStatusValues.text}
        </i>
      ) : null }
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
