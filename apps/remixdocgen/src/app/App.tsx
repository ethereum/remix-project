import React, { useState, useEffect, useMemo } from 'react'
import {
  CompilationResult,
} from '@remixproject/plugin-api/'

import './App.css'
import { DocGenClient } from './docgen-client'
import { Build } from './docgen/site'

export const client =  new DocGenClient()

export const getNewContractNames = (compilationResult: CompilationResult) => {
  const compiledContracts = compilationResult.contracts
  let result: string[] = []

  for (const file of Object.keys(compiledContracts)) {
    const newContractNames = Object.keys(compiledContracts[file])
    result = [...result, ...newContractNames]
  }
  return result
}

const App = () => {
  const [themeType, setThemeType] = useState<string>('dark');
  const [hasBuild, setHasBuild] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const watchThemeSwitch = async () => {
      client.eventEmitter.on('themeChanged', (theme: string) => {
        console.log('themeChanged', theme)
        setThemeType(theme)
      })
      client.eventEmitter.on('compilationFinished', (build: Build, fileName: string) => {
        setHasBuild(true)
        setFileName(fileName)
      })
      client.eventEmitter.on('docsGenerated', (docs: string[]) => {
        console.log('docsGenerated', docs)
      })
    }
    watchThemeSwitch()
  }, [])

  return (
    <div>
      <h1>Remix Docgen</h1>
      {fileName && <h2>File: {fileName}</h2>}
      {hasBuild && <button onClick={() => client.generateDocs()}>Generate doc</button>}
      {hasBuild && <button onClick={() => client.opendDocs()}>Open docs</button>}
    </div>
  )
};

export default App;
