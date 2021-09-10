/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useEffect, useReducer } from 'react'
import { VerticalIcons } from '../../types/vertical-icons'
import Home from './components/Home'
import Icon from './components/Icon'
import IconKind from './components/IconKind'
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
  useEffect(() => {
    // verticalIconsPlugin.emit('showContent', 'filePanel')
    // verticalIconsPlugin.events.emit('showContent', 'filePanel')
    console.log('Testing from remixUIVertical!')
  }, [])
  return (
    <div className="h-100">
      <div className="remixui_icons">
        {/* <Home
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
        </Fragment> */}
        <b>Test!</b>
      </div>
    </div>
  )
}

export default RemixUiVerticalIcons
