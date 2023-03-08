import React, { useState, useEffect, useMemo } from 'react'
import {
  CompilationResult,
} from '@remixproject/plugin-api/'

import './App.css'
import { DocGenClient } from './docgen-client'

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
  const client = useMemo(() => new DocGenClient(), [])
  const [themeType, setThemeType] = useState<string>('dark');

  useEffect(() => {
    const watchThemeSwitch = async () => {
      //await client.call("manager" as any, "activatePlugin", "ethdoc-viewer");

      const currentTheme = await client.call('theme', 'currentTheme');

      setThemeType(currentTheme.brightness || currentTheme.quality);

      client.on("theme", "themeChanged", (theme: any) => {
        setThemeType(theme.quality);
      });
    };

    watchThemeSwitch();
  }, [client]);

  return (
    <div>
      <h1>Remix Docgen</h1>
    </div>
  )
};

export default App;
