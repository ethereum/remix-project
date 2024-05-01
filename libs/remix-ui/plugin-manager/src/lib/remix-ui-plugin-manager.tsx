/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { useState } from 'react' // eslint-disable-line no-use-before-define
import { RemixUiPluginManagerProps } from '../types'
import ActivePluginCardContainer from './components/ActivePluginCardContainer'
import InactivePluginCardContainer from './components/InactivePluginCardContainer'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = ({ pluginComponent }: RemixUiPluginManagerProps) => {
  return (
    <RootView pluginComponent={pluginComponent}>
      <section data-id="pluginManagerComponentPluginManagerSection">
        <ActivePluginCardContainer pluginComponent={pluginComponent} />
        <InactivePluginCardContainer pluginComponent={pluginComponent} />
      </section>
    </RootView>
  )
}
