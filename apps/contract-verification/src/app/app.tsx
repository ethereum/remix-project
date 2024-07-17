import React, { useState, useEffect, useRef } from 'react'

import { ContractVerificationPluginClient } from './ContractVerificationPluginClient'

import { AppContext } from './AppContext'
import DisplayRoutes from './routes'
import { ThemeType } from './types'

import './App.css'
import { Chain, SubmittedContracts } from './types/VerificationTypes'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { SourcifyVerifier } from './Verifiers/SourcifyVerifier'
import { EtherscanVerifier } from './Verifiers/EtherscanVerifier'
import { AbstractVerifier } from './Verifiers/AbstractVerifier'
import { ContractDropdownSelection } from './components/ContractDropdown'

const plugin = new ContractVerificationPluginClient()

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')
  // TODO: Types for chains
  const [chains, setChains] = useState<Chain[]>([]) // State to hold the chains data
  const [targetFileName, setTargetFileName] = useState('')
  const [compilationOutput, setCompilationOutput] = useState<{ [key: string]: CompilerAbstract } | undefined>()
  const [verifiers, setVerifiers] = useState<AbstractVerifier[]>([])
  const [submittedContracts, setSubmittedContracts] = useState<SubmittedContracts>({})

  useEffect(() => {
    // const sourcifyVerifier = new SourcifyVerifier('http://sourcify.dev/server/', 'Sourcify')
    const sourcifyVerifier = new SourcifyVerifier('http://localhost:5555/', 'todo')
    const etherscanVerifier = new EtherscanVerifier('https://api.etherscan.io', 'todo', 'API_KEY')
    setVerifiers([sourcifyVerifier, etherscanVerifier])
    // TODO: Fix 'compilationFinished' event types. The interface is outdated at https://github.com/ethereum/remix-plugin/blob/master/packages/api/src/lib/compiler/api.ts. It does not include data, input, or version. See the current parameters: https://github.com/ethereum/remix-project/blob/9f6c5be882453a555055f07171701459e4ae88a4/libs/remix-solidity/src/compiler/compiler.ts#L189

    // Fetch compiler artefacts initially
    plugin.call('compilerArtefacts' as any, 'getAllCompilerAbstracts').then((obj: any) => {
      console.log('compilerArtefacts.getAllCompilerAbstracts')
      console.log(obj)
      setCompilationOutput(obj)
    })

    // Subscribe to compilations
    plugin.on('compilerArtefacts' as any, 'compilationSaved', (compilerAbstracts: { [key: string]: CompilerAbstract }) => {
      console.log('compilerArtefacts.compilationSaved')
      console.log(compilerAbstracts)
      setCompilationOutput((prev) => ({ ...(prev || {}), ...compilerAbstracts }))
    })

    // TODO: Is there a way to get all compilations from the `build-info` files without having to compile again?

    // Fetch chains.json and update state
    fetch('https://chainid.network/chains.json')
      .then((response) => response.json())
      .then((data) => setChains(data))
      .catch((error) => console.error('Failed to fetch chains.json:', error))

    // Clean up on unmount
    return () => {
      plugin.off('compilerArtefacts' as any, 'compilationSaved')
    }
  }, [])

  return (
    <AppContext.Provider value={{ themeType, setThemeType, chains, compilationOutput, targetFileName, verifiers, setVerifiers, submittedContracts, setSubmittedContracts }}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
