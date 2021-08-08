import React from 'react'
import { RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  if (JSON.parse(localStorage.getItem('newActivePlugins')) === null) {
    localStorage.setItem('newActivePlugins', '[]')
  }
  if (JSON.parse(localStorage.getItem('updatedInactives')) === null) {
    localStorage.setItem('updatedInactives', '[]')
  }
  if (JSON.parse(localStorage.getItem('plugins/local')) === null) {
    localStorage.setItem('plugins/local', '{}')
  }
  if (JSON.parse(localStorage.getItem('activatedPluginNames'))) {
    localStorage.setItem('activatedPluginNames', '[]')
  }
  return (
    <RootView pluginComponent={pluginComponent}>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActivePluginCardContainer
          pluginComponent={pluginComponent}
        />
        <InactivePluginCardContainer
          pluginComponent={pluginComponent}
        />
      </section>
    </RootView>
  )
}
