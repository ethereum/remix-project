import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment } from 'react'
import Icon from './Icon'

interface DebuggerProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

function Debugger ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: DebuggerProps) {
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

export default Debugger
