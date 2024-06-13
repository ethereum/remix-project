import React, {useState, useEffect, useRef} from 'react'

import {ContractVerificationPluginClient} from './ContractVerificationPluginClient'

import {AppContext} from './AppContext'
import DisplayRoutes from './routes'
import {CustomTooltip} from '@remix-ui/helper'
import {ThemeType} from './types'

import './App.css'
import {CompilationFileSources, CompilationResult} from '@remixproject/plugin-api'

const plugin = new ContractVerificationPluginClient()

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')
  // TODO: Types for chains
  const [chains, setChains] = useState<any>([]) // State to hold the chains data
  const [selectedChain, setSelectedChain] = useState<any | undefined>()
  const [targetFileName, setTargetFileName] = useState('')
  const [compilationOutput, setCompilationOutput] = useState<CompilationResult | undefined>()

  useEffect(() => {
    // TODO: Fix 'compilationFinished' event types. The interface is outdated at https://github.com/ethereum/remix-plugin/blob/master/packages/api/src/lib/compiler/api.ts. It does not include data, input, or version. See the current parameters: https://github.com/ethereum/remix-project/blob/9f6c5be882453a555055f07171701459e4ae88a4/libs/remix-solidity/src/compiler/compiler.ts#L189
    // Because of this reason we use @ts-expect-error for the next line
    // @ts-expect-error:next-line
    plugin.on('solidity', 'compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult, input: string, version: string) => {
      console.log('Compilation output')
      console.log(data)
      console.log('File Name:', fileName)
      console.log('Source:', source)
      console.log('Language Version:', languageVersion)
      console.log('Compilation Result:', data)
      // console.log('Input:', input)
      console.log('Compiler Version:', version)
      console.log('contractNames')
      console.log(Object.keys(data.contracts[fileName]))

      setTargetFileName(fileName)
      setCompilationOutput(undefined)
    })
    // Fetch chains.json and update state
    fetch('https://chainid.network/chains.json')
      .then((response) => response.json())
      .then((data) => setChains(data))
      .catch((error) => console.error('Failed to fetch chains.json:', error))

    return () => {
      plugin.off('solidity', 'compilationFinished') // Clean up on unmount
    }
  }, [])

  return (
    <AppContext.Provider value={{themeType, setThemeType, chains, selectedChain, setSelectedChain, compilationOutput}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
