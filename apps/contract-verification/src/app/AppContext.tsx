import React from 'react'
import {ThemeType} from './types'
import {Chain, VerifiedContract} from './types/VerificationTypes'
import {SourcifyVerifier} from './Verifiers/SourcifyVerifier'
import {CompilerAbstract} from '@remix-project/remix-solidity'

// Define the type for the context
type AppContextType = {
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
  chains: Chain[]
  compilationOutput: {[key: string]: CompilerAbstract} | undefined
  selectedContractFileAndName: string | undefined
  setSelectedContractFileAndName: (contract: string) => void
  targetFileName: string | undefined
  verifiedContracts: VerifiedContract[]
  setVerifiedContracts: (verifiedContracts: VerifiedContract[]) => void
  verifiers: SourcifyVerifier[]
  setVerifiers: (verifiers: SourcifyVerifier[]) => void
}

// Provide a default value with the appropriate types
const defaultContextValue: AppContextType = {
  themeType: 'dark',
  setThemeType: (themeType: ThemeType) => {
    console.log('Calling Set Theme Type')
  },
  chains: [],
  compilationOutput: undefined,
  selectedContractFileAndName: undefined,
  setSelectedContractFileAndName: (contract: string) => {},
  targetFileName: undefined,
  verifiedContracts: [],
  setVerifiedContracts: (verifiedContracts: VerifiedContract[]) => {},
  verifiers: [],
  setVerifiers: (verifiers: SourcifyVerifier[]) => {},
}

// Create the context with the type
export const AppContext = React.createContext<AppContextType>(defaultContextValue)
