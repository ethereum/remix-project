import { useContext, useMemo, useState } from 'react'
import { SearchableChainDropdown, ConfigInput } from '../components'
import type { VerifierIdentifier, VerifierSettings, ContractVerificationSettings } from '../types'
import { mergeChainSettingsWithDefaults } from '../utils'
import { AppContext } from '../AppContext'
import { VerifyFormContext } from '../VerifyFormContext'
import { FormattedMessage } from 'react-intl'
import { CustomTooltip } from '@remix-ui/helper'

export const SettingsView = () => {
  const { settings, setSettings } = useContext(AppContext)
  const { selectedChain, setSelectedChain } = useContext(VerifyFormContext)

  const chainSettings = useMemo(() => (selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined), [selectedChain, settings])

  const handleChange = (verifier: VerifierIdentifier, key: keyof VerifierSettings, value: string | boolean) => {
    const chainId = selectedChain.chainId.toString()
    const changedSettings: ContractVerificationSettings = JSON.parse(JSON.stringify(settings))

    if (!changedSettings.chains[chainId]) {
      changedSettings.chains[chainId] = { verifiers: {} }
    }
    if (!changedSettings.chains[chainId].verifiers[verifier]) {
      changedSettings.chains[chainId].verifiers[verifier] = {}
    }

    // @ts-ignore
    changedSettings.chains[chainId].verifiers[verifier][key] = value
    setSettings(changedSettings)
  }

  return (
    <>
      <SearchableChainDropdown label={<FormattedMessage id="contract-verification.searchableChainDropdownLabel" defaultMessage="Chain" />} id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

      {selectedChain && (
        <div>
          <div className="p-2 my-2 border">
            <span className="fw-bold">Sourcify - {selectedChain.name}</span>
            <ConfigInput label="API URL" id="sourcify-api-url" secret={false} initialValue={chainSettings.verifiers['Sourcify']?.apiUrl ?? ''} saveResult={(result) => handleChange('Sourcify', 'apiUrl', result)} />
            <CustomTooltip tooltipText="Use Sourcify API v1 instead of v2. Necessary for alternative Sourcify instances that did not upgrade.">
              <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
                <input
                  className="form-check-input ms-1"
                  type="checkbox"
                  id="sourcify-use-v1-api"
                  checked={chainSettings.verifiers['Sourcify']?.useV1API ?? false}
                  onChange={(e) => handleChange('Sourcify', 'useV1API', e.target.checked)}
                />
                <label className="form-check-label custom-control-label ms-1 pt-1" htmlFor="sourcify-use-v1-api">
                  Use V1 API
                </label>
              </div>
            </CustomTooltip>
            <ConfigInput label="Repo URL" id="sourcify-explorer-url" secret={false} initialValue={chainSettings.verifiers['Sourcify']?.explorerUrl ?? ''} saveResult={(result) => handleChange('Sourcify', 'explorerUrl', result)} />
            <ConfigInput label="Jobs URL" id="sourcify-receipts-url" secret={false} initialValue={chainSettings.verifiers['Sourcify']?.receiptsUrl ?? ''} saveResult={(result) => handleChange('Sourcify', 'receiptsUrl', result)} />
          </div>
          <div className="p-2 my-2 border">
            <span className="fw-bold">Etherscan - {selectedChain.name}</span>
            <ConfigInput label="API Key" id="etherscan-api-key" secret={true} initialValue={chainSettings.verifiers['Etherscan']?.apiKey ?? ''} saveResult={(result) => handleChange('Etherscan', 'apiKey', result)} />
            <ConfigInput label="API URL" id="etherscan-api-url" secret={false} initialValue={chainSettings.verifiers['Etherscan']?.apiUrl ?? ''} saveResult={(result) => handleChange('Etherscan', 'apiUrl', result)} />
            <ConfigInput label="Explorer URL" id="etherscan-explorer-url" secret={false} initialValue={chainSettings.verifiers['Etherscan']?.explorerUrl ?? ''} saveResult={(result) => handleChange('Etherscan', 'explorerUrl', result)} />
          </div>
          <div className="p-2 my-2 border">
            <span className="fw-bold">Blockscout - {selectedChain.name}</span>
            <ConfigInput label="Instance URL" id="blockscout-api-url" secret={false} initialValue={chainSettings.verifiers['Blockscout']?.apiUrl ?? ''} saveResult={(result) => handleChange('Blockscout', 'apiUrl', result)} />
          </div>
          <div className="p-2 my-2 border">
            <span className="fw-bold">Routescan - {selectedChain.name}</span>
            <ConfigInput label="API Key (optional)" id="routescan-api-key" secret={true} initialValue={chainSettings.verifiers['Routescan']?.apiKey ?? ''} saveResult={(result) => handleChange('Routescan', 'apiKey', result)} />
            <ConfigInput label="API URL" id="routescan-api-url" secret={false} initialValue={chainSettings.verifiers['Routescan']?.apiUrl ?? ''} saveResult={(result) => handleChange('Routescan', 'apiUrl', result)} />
            <ConfigInput label="Explorer URL" id="routescan-explorer-url" secret={false} initialValue={chainSettings.verifiers['Routescan']?.explorerUrl ?? ''} saveResult={(result) => handleChange('Routescan', 'explorerUrl', result)} />
          </div>
        </div>
      )}
    </>
  )
}
