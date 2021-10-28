/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React, { useEffect } from 'react'
import { Chevron } from './Chevron'
import Icon from './Icon'

interface SettingsProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
  scrollableRef: React.MutableRefObject<any>
  onThemeChanged: (themeType: any) => void
}

function Settings ({ scrollableRef, verticalIconsPlugin, itemContextAction, addActive, removeActive, onThemeChanged }: SettingsProps) {
  useEffect(() => {
    const themeModule = verticalIconsPlugin.registry.get('themeModule').api
    themeModule.events.on('themeChanged', (theme: any) => {
      onThemeChanged(theme.quality)
    })
  }, [onThemeChanged])
  return (
    <div id="settingsIcons" data-id="vertialIconsSettingsIcons">
      <Chevron
        divElementRef={scrollableRef}
        cssRule={'fa fa-chevron-down remixui_icon-chevron mt-0 mb-0 ml-1 pl-3'}
      />
      {Object.keys(verticalIconsPlugin.targetProfileForChange)
        .filter(p => p === 'settings')
        .map(p => (
          <Icon
            kind={
              verticalIconsPlugin.targetProfileForChange[p].kind
            }
            displayName={
              verticalIconsPlugin.targetProfileForChange[p]
                .displayName
            }
            documentation={
              verticalIconsPlugin.targetProfileForChange[p]
                .documentation
            }
            icon={
              verticalIconsPlugin.targetProfileForChange[p].icon
            }
            name={
              verticalIconsPlugin.targetProfileForChange[p].name
            }
            tooltip={
              verticalIconsPlugin.targetProfileForChange[p].tooltip
            }
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
    </div>
  )
}

export default Settings
