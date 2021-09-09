// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VerticalIcons } from 'libs/remix-ui/vertical-icons/types/vertical-icons'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Fragment } from 'react'

interface IconNameProps {
    verticalIcons: VerticalIcons
    iconName: string
    title: string
    documentation: string
    icon: string
}

function IconName ({ iconName, icon, title, documentation, verticalIcons }: IconNameProps) {
  return (
    <Fragment>
      <div
        className="remixui_icon m-2"
        onClick={() => { verticalIcons.toggle(iconName) }}
        // @ts-ignore
        plugin={iconName}
        title={title}
        onContextMenu={(e) => this.itemContextMenu(e, iconName, documentation)}
        data-id={`verticalIconsKind${iconName}`}
        id={`verticalIconsKind${name}`}
      >
        <img className="image" src={icon} alt={iconName} />
      </div>
    </Fragment>
  )
}

export default IconName
