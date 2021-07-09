import React from 'react'
import { RemixUiPluginManagerProps } from '../types'
import RootView from './components/rootView'
import PluginManagerContextProvider from './contexts/pluginmanagercontext'
import './remix-ui-plugin-manager.css'

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  console.log('current state of appmanager', props.appManager)
  console.log('The state of props ', props)

  // openLocalPlugin () {
  //   try {
  //     const profile = await props.localPlugin.open(props.appManager.getAll())
  //     if (!profile) return
  //     if (props.appManager.getIds().includes(profile.name)) {
  //       throw new Error('This name has already been used')
  //     }
  //     const plugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
  //     props.engine.register(plugin)
  //     await props.appManager.activatePlugin(plugin.name)
  //   } catch (err) {
  //     // TODO : Use an alert to handle this error instead of a console.log
  //     console.log(`Cannot create Plugin : ${err.message}`)
  //     addToolTip(`Cannot create Plugin : ${err.message}`)
  //   }
  // }

  return (
    <PluginManagerContextProvider props={props}>
      <RootView localPluginButtonText="Local Plugin"/>
    </PluginManagerContextProvider>
  )
}
