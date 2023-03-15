import React, { useState, useEffect } from 'react'
import {
  CompilationResult,
} from '@remixproject/plugin-api/'

import './App.css'
import { DocGenClient } from './docgen-client'
import { Build } from './docgen/site'

export const client =  new DocGenClient()

const App = () => {
  const [themeType, setThemeType] = useState<string>('dark');
  const [hasBuild, setHasBuild] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const watchThemeSwitch = async () => {
      client.eventEmitter.on('themeChanged', (theme: string) => {
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
    <div className="p-3">
      <h1>Remix Docgen</h1>
      {fileName && <h4>File: {fileName.split('/')[1].split('.')[0].concat('.sol')}</h4>}
      {hasBuild && <button className="btn btn-primary btn-block mt-4 rounded" onClick={() => client.generateDocs()}>Generate doc</button>}

    </div>
  )
};

export default App;
