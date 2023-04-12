import React, { useEffect, useState } from 'react'
import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { EthereumClient } from '@web3modal/ethereum'
import { RemixClient } from '../services/RemixClient'
import { WalletConnectUI } from './walletConnectUI'

const remix = new RemixClient()

function App() {
  const [ethereumClient, setEthereumClient] = useState<EthereumClient>(null)
  const [wagmiClient, setWagmiClient] = useState(null)

  useEffect(() => {
    (async () => {
      await remix.initClient()
      const ethereumClient = new EthereumClient(remix.wagmiClient, remix.chains)
      
      setWagmiClient(remix.wagmiClient)
      setEthereumClient(ethereumClient)
    })()
  }, [])

  return (
    <div className="App">
      { ethereumClient && wagmiClient && <WalletConnectUI wagmiClient={wagmiClient} ethereumClient={ethereumClient} /> }
    </div>
  )
}

export default App