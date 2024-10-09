import React from 'react'
import type { ThemeType, Chain, SubmittedContracts, ContractVerificationSettings } from './types'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { ContractVerificationPluginClient } from './ContractVerificationPluginClient'
import { ContractDropdownSelection } from './components/ContractDropdown'

// Define the type for the context
type AppContextType = {
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
  clientInstance: ContractVerificationPluginClient
  settings: ContractVerificationSettings
  setSettings: React.Dispatch<React.SetStateAction<ContractVerificationSettings>>
  chains: Chain[]
  compilationOutput: { [key: string]: CompilerAbstract } | undefined
  submittedContracts: SubmittedContracts
  setSubmittedContracts: React.Dispatch<React.SetStateAction<SubmittedContracts>>
}

// Provide a default value with the appropriate types
const defaultContextValue: AppContextType = {
  themeType: 'dark',
  setThemeType: (themeType: ThemeType) => {},
  clientInstance: {} as ContractVerificationPluginClient,
  settings: { chains: {} },
  setSettings: () => {},
  chains: [],
  compilationOutput: undefined,
  submittedContracts: {},
  setSubmittedContracts: (submittedContracts: SubmittedContracts) => {},
}

// Create the context with the type
export const AppContext = React.createContext<AppContextType>(defaultContextValue)
