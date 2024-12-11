import React from 'react'
import type { ThemeType, Chain, ContractInteractionSettings } from './types'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { ContractInteractionPluginClient } from './ContractInteractionPluginClient'

// Define the type for the context
type AppContextType = {
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
  clientInstance: ContractInteractionPluginClient
  settings: ContractInteractionSettings
  setSettings: React.Dispatch<React.SetStateAction<ContractInteractionSettings>>
  chains: Chain[]
  compilationOutput: { [key: string]: CompilerAbstract } | undefined
}

// Provide a default value with the appropriate types
const defaultContextValue: AppContextType = {
  themeType: 'dark',
  setThemeType: (themeType: ThemeType) => { },
  clientInstance: {} as ContractInteractionPluginClient,
  settings: { chains: {} },
  setSettings: () => { },
  chains: [],
  compilationOutput: undefined,
}

// Create the context with the type
export const AppContext = React.createContext<AppContextType>(defaultContextValue)
