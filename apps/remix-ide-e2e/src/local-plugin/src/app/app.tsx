import React, { useEffect, useState } from 'react'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'

import './app.css'

import { ReactComponent as Logo } from './logo.svg'

export const App = () => {
  const [remixClient, setRemixClient] = useState(null)

  useEffect(() => {
    (async () => {
      const client = createClient(new PluginClient())

      await client.onload()
      console.log('Local plugin loaded')
      setRemixClient(client)
    })()
  }, [])

  const handleClick = () => {
    remixClient.call('manager', 'activatePlugin', 'LearnEth')
  }

  return (
    <div className="app">
      <header className="flex">
        <Logo width="75" height="75" />
        <h1>Welcome to local-plugin!</h1>
      </header>
      <main>
        <button data-id="btnActivateRemixd" onClick={handleClick}>Activate Learneth</button>
      </main>
    </div>
  )
}

export default App
