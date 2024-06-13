import React from 'react'

import {AppContext} from '../AppContext'
import {Dropdown} from '../components/Input/Dropdown'

export const HomeView = () => {
  const {chains} = React.useContext(AppContext)

  const ethereumChainIds = [1, 11155111, 17000]

  // Add Ethereum chains to the head of the chains list. Sort the rest alphabetically
  const dropdownChains = chains
    .map((chain) => ({value: chain.chainId, text: `${chain.name} (${chain.chainId})`}))
    .sort((a, b) => {
      const isAInEthereum = ethereumChainIds.includes(a.value)
      const isBInEthereum = ethereumChainIds.includes(b.value)

      if (isAInEthereum && !isBInEthereum) return -1
      if (!isAInEthereum && isBInEthereum) return 1
      if (isAInEthereum && isBInEthereum) return ethereumChainIds.indexOf(a.value) - ethereumChainIds.indexOf(b.value)

      return a.text.localeCompare(b.text)
    })

  return (
    <div className="my-4">
      <div>
        <h2 className="text-center text-uppercase font-weight-bold">Verify</h2>
        <p className="text-center" style={{fontSize: '0.8rem'}}>
          Verify compiled contracts on different verification services
        </p>
      </div>
      <div>
        <Dropdown label="Network" items={dropdownChains} id="network-dropdown" />
        <div className="form-group">
          <label htmlFor="contract-address">Contract Address</label>
          <input type="text" className="form-control" id="contract-address" placeholder="0x2738d13E81e..." />
        </div>
        <Dropdown
          label="Contract Name"
          items={[
            {value: 'ERC20', text: 'ERC20'},
            {value: 'ERC721', text: 'ERC721'},
            {value: 'ERC1155', text: 'ERC1155'},
          ]}
          id="contract-name-dropdown"
        />
        <div>
          <div>Constructor Arguments</div>
          {/* TODO: Add input fields for constructor arguments */}
        </div>
      </div>
    </div>
  )
}
