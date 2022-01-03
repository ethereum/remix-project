import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment } from 'react'
import Icon from './Icon'

interface SolidityStaticAnalysisProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

function SolidityStaticAnalysis ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: SolidityStaticAnalysisProps) {
  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'solidityStaticAnalysis')
          .map(p => (
            <div id="analysisIcons" className="remixui_iconContainer" key={
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
            </div>
          ))
        : null}
    </Fragment>
  )
}

export default SolidityStaticAnalysis
