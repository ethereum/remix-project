/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React, { Fragment } from 'react'
import Icon from './Icon'

interface PluginManagerProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

function PluginManager ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: PluginManagerProps) {
  return (
    <Fragment>
      {Object.keys(verticalIconsPlugin.targetProfileForChange)
        .filter(p => p === 'pluginManager')
        .map(p => (
          <Icon
            profile={verticalIconsPlugin.targetProfileForChange[p]}
            verticalIconPlugin={verticalIconsPlugin}
            contextMenuAction={itemContextAction}
            addActive={addActive}
            removeActive={removeActive}
            key={
              verticalIconsPlugin.targetProfileForChange[p]
                .displayName
            }
          />
        ))}
    </Fragment>
  )
}

export default PluginManager
