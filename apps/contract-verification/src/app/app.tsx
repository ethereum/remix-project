import React, {useState, useEffect, useRef} from 'react'

import {ContractVerificationPluginClient} from './ContractVerificationPluginClient'

import {AppContext} from './AppContext'
import DisplayRoutes from './routes'
import {ThemeType} from './types'

import './App.css'
import {Chain, VerifiedContract} from './types/VerificationTypes'
import {SourcifyVerifier} from './Verifiers/SourcifyVerifier'
import {CompilerAbstract} from '@remix-project/remix-solidity'

const plugin = new ContractVerificationPluginClient()

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')
  // TODO: Types for chains
  const [chains, setChains] = useState<Chain[]>([]) // State to hold the chains data
  const [targetFileName, setTargetFileName] = useState('')
  const [compilationOutput, setCompilationOutput] = useState<{[key: string]: CompilerAbstract} | undefined>()
  // Contract file and name in format contracts/Storage.sol:Storage
  const [selectedContractFileAndName, setSelectedContractFileAndName] = useState<string | undefined>()
  const [verifiedContracts, setVerifiedContracts] = useState<VerifiedContract[]>([])
  const [sourcifyVerifiers, setSourcifyVerifiers] = useState<SourcifyVerifier[]>([])

  useEffect(() => {
    console.log('Selected Contract File And Name Changed', selectedContractFileAndName)
  }, [selectedContractFileAndName])

  useEffect(() => {
    // const sourcifyVerifier = new SourcifyVerifier('http://sourcify.dev/server/', 'Sourcify')
    const sourcifyVerifier = new SourcifyVerifier('http://localhost:5555/', 'Sourcify Localhost')
    setSourcifyVerifiers([sourcifyVerifier])
    // TODO: Fix 'compilationFinished' event types. The interface is outdated at https://github.com/ethereum/remix-plugin/blob/master/packages/api/src/lib/compiler/api.ts. It does not include data, input, or version. See the current parameters: https://github.com/ethereum/remix-project/blob/9f6c5be882453a555055f07171701459e4ae88a4/libs/remix-solidity/src/compiler/compiler.ts#L189

    // Fetch compiler artefacts initially
    plugin.call('compilerArtefacts' as any, 'getAllCompilerAbstracts').then((obj: any) => {
      console.log('compilerArtefacts.getAllCompilerAbstracts')
      console.log(obj)
      setCompilationOutput(obj)
    })

    // Subscribe to compilations
    plugin.on('compilerArtefacts' as any, 'compilationSaved', (compilerAbstract: {[key: string]: CompilerAbstract}) => {
      console.log('compilerArtefacts.compilationSaved')
      console.log(compilerAbstract)
      setCompilationOutput((prev) => ({...(prev || {}), ...compilerAbstract}))
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
    <AppContext.Provider value={{themeType, setThemeType, chains, compilationOutput, selectedContractFileAndName, setSelectedContractFileAndName, targetFileName, verifiedContracts, setVerifiedContracts, sourcifyVerifiers}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
