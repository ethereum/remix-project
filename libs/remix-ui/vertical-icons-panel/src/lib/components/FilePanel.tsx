import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useRef } from 'react'
import Icon from './Icon'

interface FilePanelProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

function FilePanel ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: FilePanelProps) {
  const filePanelRef = useRef(null)
  function onThemeChanged (themeType: any) {
    const invert = themeType === 'dark' ? 1 : 0
    // @ts-ignore
    const active = filePanelRef.current && filePanelRef.current.querySelector('.active')
    if (active) {
      // @ts-ignore
      const image = filePanelRef.current.querySelector('.remixui_image')
      image.style.setProperty('filter', `invert(${invert})`)
    }
  }

  useEffect(() => {
    const themeModule = verticalIconsPlugin.registry.get('themeModule').api
    themeModule.events.on('themeChanged', (theme: any) => {
      onThemeChanged(theme.quality)
    })
  }, [])

  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'filePanel')
          .map(p => (
            <div id="fileExplorerIcons" key={
              verticalIconsPlugin.targetProfileForChange[p].displayName
            } data-id="verticalIconsFileExplorerIcons"
            ref={filePanelRef}
            >
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
