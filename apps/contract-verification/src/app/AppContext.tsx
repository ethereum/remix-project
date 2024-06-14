import React from 'react'
import {ThemeType} from './types'
import {CompilationResult, CompiledContract} from '@remixproject/plugin-api'

// Define the type for the context
type AppContextType = {
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
  chains: any[]
  selectedChain: any | undefined
  setSelectedChain: (chain: string) => void
  compilationOutput: CompilationResult | undefined
  selectedContract: CompiledContract | undefined
  setSelectedContract: (contract: CompiledContract) => void
  targetFileName: string | undefined
}

// Provide a default value with the appropriate types
const defaultContextValue: AppContextType = {
  themeType: 'dark',
  setThemeType: (themeType: ThemeType) => {
    console.log('Calling Set Theme Type')
  },
  chains: [],
  selectedChain: undefined,
  setSelectedChain: (chain: string) => {},
  compilationOutput: undefined,
  selectedContract: undefined,
  setSelectedContract: (contract: CompiledContract) => {},
  targetFileName: undefined,
}

// Create the context with the type
export const AppContext = React.createContext<AppContextType>(defaultContextValue)
