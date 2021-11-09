/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React, { useEffect, useReducer } from 'react'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'
import Icon, { IconStatus } from './Icon'

function customFilter (p: string) {
  if (p !== 'settings' && p !== 'pluginManager' &&
    p !== 'filePanel' && p !== 'debugger' &&
    p !== 'compiler' && p !== 'solidity' &&
    p !== 'udapp' && p !== 'testing' && p !== 'solidityStaticAnalysis') return true
  return false
}
interface OtherIconsProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

const initialState = {
  text: '',
  key: '',
  title: '',
  type: ''
}

function OtherIcons ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: OtherIconsProps) {
  const [badgeStatus, dispatchStatusUpdate] = useReducer(iconBadgeReducer, initialState)

  useEffect(() => {
    Object.keys(verticalIconsPlugin.targetProfileForChange)
      .filter(customFilter)
      .forEach(p =>
        verticalIconsPlugin.on(verticalIconsPlugin.targetProfileForChange[p].name, 'statusChanged', (iconStatus: IconStatus) => {
          const action: IconBadgeReducerAction = {
            type: verticalIconsPlugin.targetProfileForChange[p].name,
            payload: { status: iconStatus, verticalIconPlugin: verticalIconsPlugin }
          }
          dispatchStatusUpdate(action)
        }))
  }, [])
  return (
    <div id="otherIcons">
      {
        Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(customFilter)
          .map(p => (
            <Icon
              profile={verticalIconsPlugin.targetProfileForChange[p]}
              verticalIconPlugin={verticalIconsPlugin}
              contextMenuAction={itemContextAction}
              addActive={addActive}
              removeActive={removeActive}
              key={
                verticalIconsPlugin.targetProfileForChange[p].displayName
              }
              badgeStatus={badgeStatus}
            />
          ))}
    </div>
  )
}

export default OtherIcons
