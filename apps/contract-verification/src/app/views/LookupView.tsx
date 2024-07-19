import { useContext, useState } from 'react'
import { SearchableChainDropdown, ContractAddressInput } from '../components'
import { LookupResponse, mergeChainSettingsWithDefaults, VerifierIdentifier, VERIFIERS, type Chain } from '../types'
import { AppContext } from '../AppContext'
import { CustomTooltip } from '@remix-ui/helper'
import { getVerifier } from '../Verifiers'

export const LookupView = () => {
  const { settings } = useContext(AppContext)
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [loadingVerifiers, setLoadingVerifiers] = useState<Partial<Record<VerifierIdentifier, boolean>>>({})
  const [lookupResults, setLookupResult] = useState<Partial<Record<VerifierIdentifier, LookupResponse>>>({})

  const chainSettings = selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined

  const handleLookup = () => {
    for (const verifierId of VERIFIERS) {
      if (!chainSettings.verifiers[verifierId]?.apiUrl || (verifierId === 'Etherscan' && !chainSettings.verifiers[verifierId]?.apiKey)) {
        continue
      }

      setLoadingVerifiers((prev) => ({ ...prev, [verifierId]: true }))
      console.log(chainSettings.verifiers[verifierId])
      const verifier = getVerifier(verifierId, chainSettings.verifiers[verifierId])
      verifier
        .lookup(contractAddress, selectedChain.chainId.toString())
        .then((result) => setLookupResult((prev) => ({ ...prev, [verifierId]: result })))
        .catch((err) =>
          setLookupResult((prev) => {
            console.error(err)
            return { ...prev, [verifierId]: { status: 'lookup failed' } }
          })
        )
        .finally(() => setLoadingVerifiers((prev) => ({ ...prev, [verifierId]: false })))
    }
  }

  return (
    <>
      <form onSubmit={handleLookup}>
        <SearchableChainDropdown label="Chain" id="network-dropdown" selectedChain={selectedChain} setSelectedChain={setSelectedChain} />

        <ContractAddressInput label="Contract Address" id="contract-address" contractAddress={contractAddress} setContractAddress={setContractAddress} contractAddressError={contractAddressError} setContractAddressError={setContractAddressError} />

        <button type="submit" className="btn btn-primary" disabled={!!contractAddressError || !contractAddress || !selectedChain}>
          Lookup
        </button>
      </form>
      <div className="pt-3">
        {chainSettings &&
          VERIFIERS.map((verifierId) => {
            if (!chainSettings.verifiers[verifierId]?.apiUrl || (verifierId === 'Etherscan' && !chainSettings.verifiers[verifierId]?.apiKey)) {
              const tooltipText = 'Configure API in the settings'
              return (
                <div key={verifierId} className="pt-2">
                  <div>
                    <span className="font-weight-bold text-secondary">{verifierId}</span>{' '}
                    <CustomTooltip tooltipText="Configure the API in the settings">
                      <span className="text-secondary" style={{ textDecoration: 'underline dotted' }}>
                        Enable?
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            return (
              <div key={verifierId} className="pt-2">
                <div>
                  <span className="font-weight-bold">{verifierId}</span> <span className="text-secondary">{chainSettings.verifiers[verifierId].apiUrl}</span>
                </div>
                {!!loadingVerifiers[verifierId] && (
                  <div className="pt-2 d-flex justify-content-center">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                  </div>
                )}
                {!loadingVerifiers[verifierId] && !!lookupResults[verifierId] && (
                  <div>
                    Status:{' '}
                    <span className="font-weight-bold" style={{ textTransform: 'capitalize' }}>
                      {lookupResults[verifierId].status}
                    </span>{' '}
                    {!!lookupResults[verifierId].lookupUrl && <a href={lookupResults[verifierId].lookupUrl} target="_blank" className="fa fas fa-arrow-up-right-from-square"></a>}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </>
  )
}
