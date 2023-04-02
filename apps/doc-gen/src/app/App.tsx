import React, { useState, useEffect } from 'react'

import './App.css'
import { DocGenClient } from './docgen-client'
import { Build } from './docgen/site'

export const client =  new DocGenClient()

const App = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      })
    }
    watchThemeSwitch()
  }, [])

  return (
    <div className="p-3">
      <h3>Compile a solidity contract in order to build documentation as markdown.</h3>
      {fileName && <h6>File: {fileName.concat('.sol')}</h6>}
      {hasBuild && <button className="btn btn-primary btn-block mt-4 rounded" onClick={() => client.generateDocs()}>Generate doc</button>}
    </div>
  )
}

export default App
