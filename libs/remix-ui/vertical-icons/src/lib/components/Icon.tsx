import { Kind, VerticalIcons } from 'libs/remix-ui/vertical-icons/types/vertical-icons'
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

function Icon ({ kind, name, icon, displayName, tooltip, documentation, verticalIconPlugin }: IconProps) {
  const [title] = useState(() => {
    const temp = tooltip || displayName || name
    return temp.replace(/^\w/, word => word.toUpperCase())
  })
  return (
    <Fragment>
      <div
        className="remixui_icon m-2"
        onClick={() => verticalIconPlugin.toggle(name)}
        // @ts-ignore
        plugin={name}
        title={title}
        onContextMenu={(e: SyntheticEvent) => verticalIconPlugin.itemContextMenu(e, name, documentation)}
        data-id={`verticalIconsKind${name}`}
        id={`verticalIconsKind${name}`}
      >
        <img className="remixui_image" src={icon} alt={name} />
      </div>
      {
        kind && kind === verticalIconPlugin.iconKind.kind ? verticalIconPlugin.iconKind[kind as Kind]
          // eslint-disable-next-line dot-notation
          : verticalIconPlugin.iconKind['none'].appendChild(verticalIconPlugin.icons[name])
      }
    </Fragment>
  )
}

export default Icon
