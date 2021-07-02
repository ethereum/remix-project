import React from 'react'
import { Profile } from '../customTypes'
import './remix-ui-plugin-manager.css'

/* eslint-disable-next-line */
export interface RemixUiPluginManagerProps {
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: () => void
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  reRender: () => void
  profile: Profile
}

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  return (
    <div>
      <h1>Welcome to remix-ui-plugin-manager!</h1>
    </div>
  )
}

export default RemixUiPluginManager
