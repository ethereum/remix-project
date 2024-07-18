import { useState } from 'react'
import { SearchableChainDropdown, ConfigInput } from '../components'
import type { Chain } from '../types'

export const SettingsView = () => {
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()

  return (
    <>
      <SearchableChainDropdown label="Chain" id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

      {selectedChain && (
        <div className="pt-2">
          <span className="font-weight-bold">Etherscan</span>
          <ConfigInput label="API Key" id="etherscan-api-key" secret={true} initialValue="key" saveResult={() => {}} />
          <ConfigInput label="API URL" id="etherscan-api-url" secret={false} initialValue="url" saveResult={() => {}} />
        </div>
      )}
    </>
  )
}
