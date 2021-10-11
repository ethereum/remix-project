/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
<<<<<<< HEAD
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
=======
import React, { ReactNode } from 'react'

interface OtherIconsProps {
  children: ReactNode
}

function OtherIcons ({ children }: OtherIconsProps) {
  return (
    <div id="otherIcons">{ children }</div>
>>>>>>> b6322066e (update components and setttings)
  )
}

export default OtherIcons
