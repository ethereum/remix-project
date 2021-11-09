import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useReducer } from 'react'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'
import Badge from './Badge'
import Icon, { IconStatus } from './Icon'

interface DebuggerProps {
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

function Debugger ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: DebuggerProps) {
  const [badgeStatus, dispatchStatusUpdate] = useReducer(iconBadgeReducer, initialState)

  useEffect(() => {
    verticalIconsPlugin.on('debugger', 'statusChanged', (iconStatus: IconStatus) => {
      const action: IconBadgeReducerAction = { type: 'debugger', payload: { status: iconStatus, verticalIconPlugin: verticalIconsPlugin } }
      dispatchStatusUpdate(action)
    })
  }, [])

  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'debugger')
          .map(p => (
            <div id="debuggingIcons" data-id="verticalIconsDebuggingIcons" key={
              verticalIconsPlugin.targetProfileForChange[p].displayName
            }>
              <Icon
                profile={verticalIconsPlugin.targetProfileForChange[p]}
                verticalIconPlugin={verticalIconsPlugin}
                contextMenuAction={itemContextAction}
                addActive={addActive}
                removeActive={removeActive}
                key={
                  verticalIconsPlugin.targetProfileForChange[p].displayName
                }
              />
              <Badge
                badgeStatus={badgeStatus}
              />
            </div>
          ))
        : null}
    </Fragment>
  )
}

export default Debugger
