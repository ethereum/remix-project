/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { ReactNode } from 'react'

interface SettingsProps {
  children: ReactNode
}

function Settings ({ children }: SettingsProps) {
  return (
    <div id="settingsIcons" data-id="vertialIconsSettingsIcons">{ children }</div>
  )
}

export default Settings
