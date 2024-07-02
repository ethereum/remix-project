import { useState } from 'react'
import { SearchableChainDropdown, ContractAddressInput } from '../components'
import { Chain } from '../types/VerificationTypes'

export const LookupView = () => {
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [contractAddress, setContractAddress] = useState('')

  const handleLookup = () => {}

  return (
    <form onSubmit={handleLookup}>
      <SearchableChainDropdown label="Chain" id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

      <ContractAddressInput label="Contract Address" id="contract-address" setContractAddress={setContractAddress} contractAddress={contractAddress} />

      <button type="submit" className="btn btn-primary">
        Lookup
      </button>
    </form>
  )
}
