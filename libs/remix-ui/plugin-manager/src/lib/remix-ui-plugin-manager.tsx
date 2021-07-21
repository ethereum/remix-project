import React from 'react'
import { RemixUiPluginManagerProps } from '../types'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  return (
    <RootView pluginComponent={props.pluginComponent}/>
  )
}
