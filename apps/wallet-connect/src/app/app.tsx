import React, { useEffect, useState } from 'react'
import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { PROJECT_ID } from '../services/constant'
import { EthereumClient } from '@web3modal/ethereum'
import { Web3Button, Web3Modal, Web3NetworkSwitch } from '@web3modal/react'
import { WagmiConfig } from 'wagmi'
import { RemixClient } from '../services/RemixClient'

const p = new RemixClient()

function App() {
  const [ethereumClient, setEthereumClient] = useState<EthereumClient>(null)
  const [wagmiClient, setWagmiClient] = useState(null)

  useEffect(() => {
    (async () => {
      await p.init()
      const ethereumClient = new EthereumClient(p.wagmiClient, p.chains)
      
      setWagmiClient(p.wagmiClient)
      setEthereumClient(ethereumClient)
    })()
  }, [])

  return (
    <div className="App">
          <div style={{ display: 'inline-block' }}>
            { wagmiClient && <WagmiConfig client={wagmiClient}>
                <Web3Button label='Connect to a wallet' />
              </WagmiConfig>
            }
          </div>
          <div style={{ display: 'inline-block', paddingLeft: 30, marginTop: 5 }}>
            { wagmiClient && 
              <WagmiConfig client={wagmiClient}>
                <Web3NetworkSwitch />
              </WagmiConfig>
            }
          </div>
      { ethereumClient && <Web3Modal projectId={PROJECT_ID} ethereumClient={ethereumClient} themeMode={'dark'} /> }
    </div>
  )
}

export default App