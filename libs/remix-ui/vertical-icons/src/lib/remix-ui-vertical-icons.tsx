/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useEffect, useReducer } from 'react'
import { IconKindType, VerticalIcons } from '../../types/vertical-icons'
import Home from './components/Home'
import Icon from './components/Icon'
import IconKind from './components/IconKind'
import ShowIcons from './components/ShowIcons'
import { resolveClassesReducer } from './reducers/verticalIconsPanelReducers'
import './remix-ui-vertical-icons.css'
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
}

export const RemixUiVerticalIcons = ({ verticalIconsPlugin }: RemixUiVerticalIconsProps) => {
  const [classes, dispatchResolveClasses] = useReducer(resolveClassesReducer, '')
  const AddIcon = ({ kind, name, icon, displayName, tooltip, documentation }) => {
    return (
      <Icon
        displayName={displayName}
        name={name}
        kind={kind}
        icon={icon}
        tooltip={tooltip}
        documentation={documentation}
        verticalIconPlugin={verticalIconsPlugin}
      />
    )
  }

  function checkIconKind (iconKind: IconKindType) {
    if (iconKind && Object.keys(iconKind.kind).length > 0) {
      return iconKind
    }
    iconKind.kind = {
      fileexplorer: 'fileexplorer',
      complier: 'compiler',
      udapp: 'udapp',
      testing: 'testing',
      analysis: 'analysis',
      debugging: 'debugging',
      settings: 'settings',
      none: 'none'
    }
    return iconKind
  }
  return (
    <div className="h-100">
      <div className="remixui_icons">
        <Home
          verticalIconPlugin={verticalIconsPlugin}
        />
        <ShowIcons />
      </div>
    </div>
  )
}

export default RemixUiVerticalIcons
