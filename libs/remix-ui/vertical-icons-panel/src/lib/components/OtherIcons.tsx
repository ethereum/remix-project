/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React from 'react'
import Icon from './Icon'

interface OtherIconsProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

const profileNames = ['settings', 'pluginManager', 'filePanel', 'debugger', 'compiler', 'solidity', 'udapp', 'testing', 'solidityStaticAnalysis']
function OtherIcons ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: OtherIconsProps) {
  return (
    <div id="otherIcons">
      {
        Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(function (searchTerm: string) {
            for (var key in profileNames) {
              if (searchTerm !== key) return true
            }
            return false
          })
          .map(p => (
            <Icon
              kind={verticalIconsPlugin.targetProfileForChange[p].kind}
              displayName={
                verticalIconsPlugin.targetProfileForChange[p].displayName
              }
              documentation={
                verticalIconsPlugin.targetProfileForChange[p].documentation
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
          ))}
    </div>
  )
}

export default OtherIcons
