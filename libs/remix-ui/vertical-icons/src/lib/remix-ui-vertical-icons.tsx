/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment } from 'react'
import { VerticalIcons } from '../../types/vertical-icons'
import Home from './components/Home'
import IconKind from './components/IconKind'
import './remix-ui-vertical-icons.css'
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
}

export const RemixUiVerticalIcons = ({ verticalIconsPlugin }: RemixUiVerticalIconsProps) => {
  return (
    <div className="h-100">
      <div className="remixui_icons">
        <Home
          verticalIconPlugin={verticalIconsPlugin}
        />
        <Fragment>
          {Object.keys(verticalIconsPlugin.iconKind.kind).map(
            (kind: 'fileexplorer' | 'compiler' | 'udapp' | 'testing' | 'analysis' | 'debugging' | 'settings' | 'none') => {
              return (
                <IconKind
                  idName={kind}
                />
              )
            })}
        </Fragment>
      </div>
    </div>
  )
}

export default RemixUiVerticalIcons
