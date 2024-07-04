import React from 'react'
import { ThemeType } from './types'
import { Chain, SubmittedContracts } from './types/VerificationTypes'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './Verifiers/AbstractVerifier'

// Define the type for the context
type AppContextType = {
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
  chains: Chain[]
  compilationOutput: { [key: string]: CompilerAbstract } | undefined
  targetFileName: string | undefined
  verifiers: AbstractVerifier[]
  setVerifiers: React.Dispatch<React.SetStateAction<AbstractVerifier[]>>
  submittedContracts: SubmittedContracts
  setSubmittedContracts: React.Dispatch<React.SetStateAction<SubmittedContracts>>
}

// Provide a default value with the appropriate types
const defaultContextValue: AppContextType = {
  themeType: 'dark',
  setThemeType: (themeType: ThemeType) => {
    console.log('Calling Set Theme Type')
  },
  chains: [],
  compilationOutput: undefined,
  targetFileName: undefined,
  verifiers: [],
  setVerifiers: (verifiers: AbstractVerifier[]) => {},
  submittedContracts: {},
  setSubmittedContracts: (submittedContracts: SubmittedContracts) => {},
}

// Create the context with the type
export const AppContext = React.createContext<AppContextType>(defaultContextValue)
