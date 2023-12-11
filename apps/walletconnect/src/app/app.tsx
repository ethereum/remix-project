import React, {useEffect, useState} from 'react'
import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import type {EthereumClient} from '@web3modal/ethereum'
import {WalletConnectRemixClient} from '../services/WalletConnectRemixClient'
import {WalletConnectUI} from './walletConnectUI'

const remix = new WalletConnectRemixClient()

function App() {
  const [ethereumClient, setEthereumClient] = useState<EthereumClient>(null)
  const [wagmiConfig, setWagmiConfig] = useState(null)
  const [theme, setTheme] = useState<string>('dark')

  useEffect(() => {
    ;(async () => {
      await remix.initClient()
      remix.internalEvents.on('themeChanged', (theme: string) => {
        setTheme(theme)
      })

      setWagmiConfig(remix.wagmiConfig)
      setEthereumClient(remix.ethereumClient)
    })()
  }, [])

  return (
    <div className="App">
      <h4 className="mt-1">WalletConnect</h4>
      {ethereumClient && wagmiConfig && <WalletConnectUI wagmiConfig={wagmiConfig} ethereumClient={ethereumClient} theme={theme} />}
    </div>
  )
}

export default App
