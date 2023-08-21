import {Web3Button, Web3Modal} from '@web3modal/react'
import {WagmiConfig} from 'wagmi'
import {PROJECT_ID} from '../services/constant'

export function WalletConnectUI({ethereumClient, wagmiConfig, theme}) {
  return (
    <div>
      <div style={{display: 'inline-block'}}>
        <WagmiConfig config={wagmiConfig}>
          <Web3Button label="Connect to a wallet" />
        </WagmiConfig>
      </div>
      <Web3Modal
        projectId={PROJECT_ID}
        ethereumClient={ethereumClient}
        themeMode={theme}
      />
    </div>
  )
}
