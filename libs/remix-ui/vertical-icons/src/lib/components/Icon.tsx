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
  const [links, setLinks] = useState<{ Documentation: string }>(
    {} as { Documentation: string }
  )
  const [pageX, setPageX] = useState<number>(null)
  const [pageY, setPageY] = useState<number>(null)
  const [showContext, setShowContext] = useState(false)
  const [canDeactivate, flipCanDeactivate] = useState(false)

  const handleContextMenu = (e: SyntheticEvent & PointerEvent) => {
    if (documentation) {
      setLinks({ Documentation: documentation })
    }
    setShowContext(false)
    setPageX(e.pageX)
    setPageY(e.pageY)
    // verticalIconPlugin.itemContextMenu(e, name, documentation)
    deactivateAction(
      verticalIconPlugin.defaultProfile,
      name,
      e,
      verticalIconPlugin
    )
    setShowContext(true)
  }
  const closeContextMenu = (evt: any & PointerEvent) => {
    console.log('evt is ', evt)
    setShowContext(false)
  }

  const deactivateAction = async (
    profile: defaultModuleProfile,
    name: string,
    e: SyntheticEvent & PointerEvent,
    verticalIconPlugin: VerticalIcons
  ) => {
    const actions = {}
    if (
      await verticalIconPlugin.appManager.canDeactivatePlugin(profile, { name })
    ) {
      console.log('name passed into canDeactivate ', name)
      console.log('e in itemContextMenu is ', e)
      // actions['Deactivate'] = () =>
      //   verticalIconPlugin.appManager.deactivatePlugin(name)
      flipCanDeactivate(true)
    }
    return actions
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
