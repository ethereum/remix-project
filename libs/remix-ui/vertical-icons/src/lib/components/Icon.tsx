import {
  defaultModuleProfile,
  VerticalIcons
} from 'libs/remix-ui/vertical-icons/types/vertical-icons'
import VerticalIconsContextMenu from '../vertical-icons-context-menu'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Fragment, SyntheticEvent, useState } from 'react'

interface IconProps {
  verticalIconPlugin: VerticalIcons
  kind: string
  name: string
  icon: string
  displayName: string
  tooltip: string
  documentation: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Icon({
  kind,
  name,
  icon,
  displayName,
  tooltip,
  documentation,
  verticalIconPlugin
}: IconProps) {
  const [title] = useState(() => {
    const temp = tooltip || displayName || name
    return temp.replace(/^\w/, word => word.toUpperCase())
  })
  const [links, setLinks] = useState<{ Documentation: string, CanDeactivate: boolean }>(
    {} as { Documentation: string, CanDeactivate: boolean }
  )
  const [pageX, setPageX] = useState<number>(null)
  const [pageY, setPageY] = useState<number>(null)
  const [showContext, setShowContext] = useState(false)
  const [canDeactivate, flipCanDeactivate] = useState(false)

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
  const closeContextMenu = () => {
    setShowContext(false)
  }

  return (
    <Fragment>
      <div
        className="remixui_icon m-2"
        onClick={() => verticalIconPlugin.toggle(name)}
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
      >
        <img className="remixui_image" src={icon} alt={name} />
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
        />
      ) : null}
    </Fragment>
  )
}

export default Icon
