import React from 'react'
import { VerticalIcons } from '../../types/vertical-icons'

import './remix-ui-vertical-icons.css'

/* eslint-disable-next-line */
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
}

export const RemixUiVerticalIcons = ({ verticalIconsPlugin }: RemixUiVerticalIconsProps) => {
  return (
    <div>
      <h1>Welcome to remix-ui-vertical-icons!</h1>
    </div>
  )
}

export default RemixUiVerticalIcons
