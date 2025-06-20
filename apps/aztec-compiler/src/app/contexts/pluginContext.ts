import { createContext } from 'react'
import { PluginClient } from '@remixproject/plugin'

export const PluginContext = createContext<{
  plugin: PluginClient
  dispatch: React.Dispatch<any>
  state: any
}>(null as any)
