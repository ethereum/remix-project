import React from 'react'

import {AppContext} from '../AppContext'
import {Dropdown} from '../components'
import {SearchableDropdown} from '../components'

export const HomeView = () => {
  const {chains, selectedChain, setSelectedChain, contractNames} = React.useContext(AppContext)

  const ethereumChainIds = [1, 3, 4, 5, 11155111, 17000]

  // Add Ethereum chains to the head of the chains list. Sort the rest alphabetically
  const dropdownChains = chains
    .map((chain) => ({value: chain.chainId, name: `${chain.title || chain.name} (${chain.chainId})`}))
    .sort((a, b) => {
      const isAInEthereum = ethereumChainIds.includes(a.value)
      const isBInEthereum = ethereumChainIds.includes(b.value)

      if (isAInEthereum && !isBInEthereum) return -1
      if (!isAInEthereum && isBInEthereum) return 1
      if (isAInEthereum && isBInEthereum) return ethereumChainIds.indexOf(a.value) - ethereumChainIds.indexOf(b.value)

      return a.name.localeCompare(b.name)
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
        <SearchableDropdown label="Contract Chain" options={dropdownChains} id="network-dropdown" value={selectedChain} onChange={setSelectedChain} />

        <div className="form-group">
          <label htmlFor="contract-address">Contract Address</label>
          <input type="text" className="form-control" id="contract-address" placeholder="0x2738d13E81e..." />
        </div>

        {contractNames.length > 0 ? <Dropdown label="Contract Name" items={contractNames.map((item) => ({value: item, name: item}))} id="contract-name-dropdown" /> : <div> No compiled contracts </div>}
        <div>
          <div>Constructor Arguments</div>
          {/* TODO: Add input fields for constructor arguments */}
        </div>
      </div>
    </div>
  )
}
