import React from 'react'
import { RemixUiPluginManagerProps } from '../types'
import RootView from './components/rootView'
import PluginManagerContextProvider from './contexts/pluginmanagercontext'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  console.log('current state of appmanager', props.appManager)
  console.log('The state of props ', props)
  return (
    // <PluginManagerContextProvider props={props}>
    //   <RootView
    //     localPluginButtonText="Connect to a Local Plugin"
    //   />
    // </PluginManagerContextProvider>
    <PluginManagerContextProvider props={props}>
      <h3 className="h3">Remix UI Plugin Manager React</h3>
      <RootView localPluginButtonText="Local Plugin"/>
    </PluginManagerContextProvider>
  )
}
