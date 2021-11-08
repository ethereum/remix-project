import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useReducer } from 'react'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'
import Badge from './Badge'
import Icon, { IconStatus } from './Icon'

interface SolidityStaticAnalysisProps {
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

function SolidityStaticAnalysis ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: SolidityStaticAnalysisProps) {
  const [badgeStatus, dispatchStatusUpdate] = useReducer(iconBadgeReducer, initialState)
  useEffect(() => {
    verticalIconsPlugin.on('solidityStaticAnalysis', 'statusChanged', (iconStatus: IconStatus) => {
      const action: IconBadgeReducerAction = { type: 'solidityStaticAnalysis', payload: { status: iconStatus, verticalIconPlugin: verticalIconsPlugin } }
      dispatchStatusUpdate(action)
    })
  }, [])
  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'solidityStaticAnalysis')
          .map(p => (
            <div id="analysisIcons" key={
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
              {
                badgeStatus && verticalIconsPlugin.keys.includes(badgeStatus.key) &&
                  verticalIconsPlugin.types.includes(badgeStatus.type) ? (
                    <Badge
                      badgeStatus={badgeStatus}
                    />
                  ) : null
              }
            </div>
          ))
        : null}
    </Fragment>
  )
}

export default SolidityStaticAnalysis
