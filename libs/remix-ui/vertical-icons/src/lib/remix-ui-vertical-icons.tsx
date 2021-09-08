/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { VerticalIcons } from '../../types/vertical-icons'

import './remix-ui-vertical-icons.css'

/* eslint-disable-next-line */
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
}

export const RemixUiVerticalIcons = ({ verticalIconsPlugin }: RemixUiVerticalIconsProps) => {
  return (
    <div className="h-100">
      <div className="remixui_icons">
        <h1>Remix!!</h1>
      </div>
    </div>
  )
}

export default RemixUiVerticalIcons
