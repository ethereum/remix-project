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
    // Because of this reason we use @ts-expect-error for the next line
    // // @ts-expect-error:next-line
    // plugin.on('solidity', 'compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult, input: string, version: string) => {
    //   console.log('Compilation output')
    //   console.log(data)
    //   console.log('File Name:', fileName)
    //   console.log('Source:', source)
    //   console.log('Language Version:', languageVersion)
    //   console.log('Compilation Result:', data)
    //   // console.log('Input:', input)
    //   console.log('Compiler Version:', version)
    //   console.log('contractNames')
    //   console.log(Object.keys(data.contracts[fileName]))

    //   setTargetFileName(fileName)
    //   setCompilationOutput(data)
    // })

    // plugin.call('compilerArtefacts', 'getAllContractDatas').then((allContractDatas: any) => {
    //   console.log('compilerArtefacts.getAllContractDatas')
    //   console.log(allContractDatas)
    //   const files = Object.keys(allContractDatas)
    //   files.forEach((file) => {
    //     //
    //     plugin.call('compilerArtefacts' as any, 'getCompilerAbstract', file).then((data: any) => {
    //       console.log('compilerArtefacts.getCompilerAbstract ' + file)
    //       console.log(data)
    //     })
    //   })
    // })

    // // TODO: why "as any" needed here
    // plugin.call('compilerArtefacts' as any, 'getLastCompilationResult').then((data: any) => {
    //   console.log('compilerArtefacts.getLastCompilationResult')
    //   console.log(data)
    // })

    plugin.call('compilerArtefacts' as any, 'getAllCompilerAbstracts').then((obj: any) => {
      console.log('compilerArtefacts.getAllCompilerAbstracts')
      console.log(obj)
      setCompilationOutput(obj)
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
    <AppContext.Provider value={{themeType, setThemeType, chains, compilationOutput, selectedContractFileAndName, setSelectedContractFileAndName, targetFileName, verifiedContracts, setVerifiedContracts, sourcifyVerifiers}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
