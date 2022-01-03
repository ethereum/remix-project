/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React from 'react'
import Icon from './Icon'

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

function OtherIcons ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: OtherIconsProps) {
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
            />
          ))}
    </div>
  )
}

export default OtherIcons
