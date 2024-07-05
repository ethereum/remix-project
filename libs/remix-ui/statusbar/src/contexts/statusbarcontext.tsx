import React, { createContext } from 'react'
import { defaultStatusBarContext, StatusBarContextType, StatusBarInterface } from '../lib/types'

export const StatusBarContext = createContext<StatusBarContextType>(defaultStatusBarContext)

export function StatusBarContextProvider ({ children }) {
  const statusBarProviderValues = {
    test: true
  }
  return (
    <>
      <StatusBarContext.Provider value={statusBarProviderValues}>
        {children}
      </StatusBarContext.Provider>
    </>
  )
}
