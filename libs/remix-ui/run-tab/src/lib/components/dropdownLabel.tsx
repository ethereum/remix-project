import { Provider } from '@remix-ui/environment-explorer'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { RunTabState } from '../types'
import { current } from '@reduxjs/toolkit'

export type DropDownLabelProps = {
  label: string
  bridges: any
  currentProvider: any
  chainId: string
  runTabState: RunTabState
  setExecutionEnv: (executionContext: {
    context: string;
  }) => void
  isL2: (providerDisplayName: string) => boolean
}

export function DropdownLabel({ label, bridges, currentProvider, chainId, runTabState, setExecutionEnv, isL2 }: DropDownLabelProps) {

  const [renderLabel, setRenderLabel] = useState(label)

  const selectedEnvs = [
    { name: 'Remix VM (Cancun)', value: 'vm-cancun', chainId: 'vm-cancun' },
    { name: 'Gnosis Mainnet - MetaMask', value: 'injected-metamask-gnosis', chainId: 100 },
    { name: 'L2 - Optimism - MetaMask', value: 'injected-metamask-optimism', chainId: 10 },
    { name: 'L2 - Arbitrum - MetaMask', value: 'injected-metamask-arbitrum', chainId: 42161 },
    { name: 'Ephemery Testnet - MetaMask', value: 'injected-metamask-ephemery', chainId: 39438143 },
    { name: 'Sepolia Testnet - MetaMask', value: 'injected-metamask-sepolia', chainId: 11155111 },
    { name: 'L2 - Linea - MetaMask', value: 'injected-metamask-linea', chainId: 59144 },
    { name: 'Injected Provider - MetaMask', value: 'injected-MetaMask' },
    { name: 'WalletConnect', value: 'walletconnect' },
    { name: 'Remix VM - Mainnet fork', value: 'vm-mainnet-fork', chainId: 'vm-mainnet-fork' },
    { name: 'Remix VM - Sepolia fork', value: 'vm-sepolia-fork', chainId: 'vm-sepolia-fork' },
    { name: 'Remix VM - Custom fork', value: 'vm-custom-fork', chainId: 'vm-custom-fork' },
    { name: 'Remix VM (Shanghai)', value: 'vm-shanghai', chainId: 'vm-shanghai' },
    { name: 'Remix VM (Paris)', value: 'vm-paris', chainId: 'vm-paris' },
    { name: 'Remix VM (London)', value: 'vm-london', chainId: 'vm-london' },
    { name: 'Remix VM (Berlin)', value: 'vm-berlin', chainId: 'vm-berlin' },
    { name: 'Custom - External Http Provider', value: 'basic-http-provider', chainId: 1741104841094 },
    { name: 'Dev - Hardhat Provider', value: 'hardhat-provider', chainId: 31337 },
    { name: 'Dev - Foundry Provider', value: 'foundry-provider', chainId: 31337 },
    { name: 'Dev - Ganache Provider', value: 'ganache-provider', chainId: 1741104841094 },
  ]
  console.log('runTabState', runTabState)
  useEffect(() => {
    const selectedEnv = selectedEnvs.find(env => (env.chainId === chainId && env.value === runTabState.selectExEnv) || (env.value === 'walletconnect' && env.value === currentProvider?.name) || env.chainId === chainId)
    if (selectedEnv) {
      setRenderLabel(selectedEnv.name)
      setExecutionEnv({ context: selectedEnv.value })
    } else {
      setRenderLabel('Injected Provider - MetaMask')
    }
  }, [chainId])

  return (
    <>
      <span>{renderLabel}</span>
      {isL2(renderLabel) && bridges[renderLabel.substring(0, 13)] && (
        <CustomTooltip placement={'auto-end'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText3" />}>
          <i
            style={{ fontSize: 'medium' }}
            className={'ml-1 fa fa-rocket-launch'}
            aria-hidden="true"
            onClick={() => {
              window.open(bridges[currentProvider.displayName.substring(0, 13)], '_blank')
            }}
          ></i>
        </CustomTooltip>
      )}
    </>
  )
}
