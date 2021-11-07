/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React, { useEffect, useRef } from 'react'
import { Chevron } from './Chevron'
import Icon from './Icon'

interface SettingsProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
  scrollableRef: React.MutableRefObject<any>
}

function Settings ({ scrollableRef, verticalIconsPlugin, itemContextAction, addActive, removeActive }: SettingsProps) {
  const settingsRef = useRef(null)
  function onThemeChanged (themeType: any) {
    const invert = themeType === 'dark' ? 1 : 0
    // @ts-ignore
    const active = settingsRef.current.querySelector('.active')
    if (active) {
      // @ts-ignore
      const image = settingsRef.current.querySelector('.remixui_image')
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
    <div id="settingsIcons" className="remixui_settings mb-0 flex-grow-0" data-id="vertialIconsSettingsIcons" ref={settingsRef}>
      <Chevron
        divElementRef={scrollableRef}
        cssRule={'fa fa-chevron-down remixui_icon-chevron mt-0 mb-0 ml-1 pl-3'}
      />
      {Object.keys(verticalIconsPlugin.targetProfileForChange)
        .filter(p => p === 'settings')
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
    </div>
  )
}

export default Settings
