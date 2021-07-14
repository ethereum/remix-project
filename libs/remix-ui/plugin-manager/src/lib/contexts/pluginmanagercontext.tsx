import React, { createContext } from 'react'
import { PluginManagerContextProviderProps } from '../../types'

export const PluginManagerContext = createContext<Partial<PluginManagerContextProviderProps>>({})

function PluginManagerContextProvider ({ children, props }) {
  return (
    <PluginManagerContext.Provider value={props}>
      {children}
    </PluginManagerContext.Provider>
  )
}

export default PluginManagerContextProvider
