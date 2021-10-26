import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import { Fragment } from 'react'
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
            <div id="analysisIcons" key={
              verticalIconsPlugin.targetProfileForChange[p].displayName
            }>
              <Icon
                kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                displayName={
                  verticalIconsPlugin.targetProfileForChange[p].displayName
                }
                documentation={
                  verticalIconsPlugin.targetProfileForChange[p]
                    .documentation
                }
                icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                name={verticalIconsPlugin.targetProfileForChange[p].name}
                tooltip={
                  verticalIconsPlugin.targetProfileForChange[p].tooltip
                }
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
