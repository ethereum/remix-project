import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment } from 'react'
import Icon from './Icon'

interface FilePanelProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

function FilePanel ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: FilePanelProps) {
  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'filePanel')
          .map(p => (
            <div id="fileExplorerIcons" key={
              verticalIconsPlugin.targetProfileForChange[p].displayName
            } data-id="verticalIconsFileExplorerIcons">
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
              />
            </div>
          ))
        : null}
    </Fragment>
  )
}

export default FilePanel
