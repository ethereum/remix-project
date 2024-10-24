import { useContext, useEffect, useMemo, useState } from 'react'
import { SearchableChainDropdown, ContractAddressInput } from '../components'
import { mergeChainSettingsWithDefaults, validConfiguration } from '../utils'
import type { LookupResponse, VerifierIdentifier } from '../types'
import { VERIFIERS } from '../types'
import { AppContext } from '../AppContext'
import { CustomTooltip } from '@remix-ui/helper'
import { getVerifier } from '../Verifiers'
import { useNavigate } from 'react-router-dom'
import { VerifyFormContext } from '../VerifyFormContext'
import { useSourcifySupported } from '../hooks/useSourcifySupported'

export const LookupView = () => {
  const { settings, clientInstance } = useContext(AppContext)
  const { selectedChain, setSelectedChain } = useContext(VerifyFormContext)
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [loadingVerifiers, setLoadingVerifiers] = useState<Partial<Record<VerifierIdentifier, boolean>>>({})
  const [lookupResults, setLookupResult] = useState<Partial<Record<VerifierIdentifier, LookupResponse>>>({})
  const navigate = useNavigate()

  const chainSettings = useMemo(() => (selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined), [selectedChain, settings])

  const sourcifySupported = useSourcifySupported(selectedChain, chainSettings)

  const noVerifierEnabled = VERIFIERS.every((verifierId) => !validConfiguration(chainSettings, verifierId) || (verifierId === 'Sourcify' && !sourcifySupported))
  const submitDisabled = !!contractAddressError || !contractAddress || !selectedChain || noVerifierEnabled

  // Reset results when chain or contract changes
  useEffect(() => {
    setLookupResult({})
    setLoadingVerifiers({})
  }, [selectedChain, contractAddress])

  const handleLookup = (e) => {
    if (Object.values(loadingVerifiers).some((loading) => loading)) {
      console.error('Lookup request already running')
      return
    }

    e.preventDefault()

    for (const verifierId of VERIFIERS) {
      if (!validConfiguration(chainSettings, verifierId) || (verifierId === 'Sourcify' && !sourcifySupported)) {
        continue
      }

      setLoadingVerifiers((prev) => ({ ...prev, [verifierId]: true }))
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

  const sendToMatomo = async (eventAction: string, eventName: string) => {
    await clientInstance.call('matomo' as any, 'track', ['trackEvent', 'ContractVerification', eventAction, eventName]);
  }
  
  const handleOpenInRemix = async (lookupResponse: LookupResponse) => {
    for (const source of lookupResponse.sourceFiles ?? []) {
      try {
        await clientInstance.call('fileManager', 'setFile', source.path, source.content)
      } catch (err) {
        console.error(`Error while creating file ${source.path}: ${err.message}`)
      }
    }
    try {
      await clientInstance.call('fileManager', 'open', lookupResponse.targetFilePath)
      await sendToMatomo('lookup', "openInRemix On: " + selectedChain)
    } catch (err) {
      console.error(`Error focusing file ${lookupResponse.targetFilePath}: ${err.message}`)
    }
  }

  return (
    <>
      <form onSubmit={handleLookup}>
        <SearchableChainDropdown label="Chain" id="network-dropdown" selectedChain={selectedChain} setSelectedChain={setSelectedChain} />
        <ContractAddressInput
          label="Contract Address"
          id="contract-address"
          contractAddress={contractAddress}
          setContractAddress={setContractAddress}
          contractAddressError={contractAddressError}
          setContractAddressError={setContractAddressError}
        />
        <button type="submit" className="btn w-100 btn-primary" disabled={submitDisabled}>
          Lookup
        </button>
      </form>
      <div className="pt-3">
        { chainSettings &&
          VERIFIERS.map((verifierId) => {
            if (!validConfiguration(chainSettings, verifierId)) {
              return (
                <div key={verifierId} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{verifierId}</span>{' '}
                    <CustomTooltip tooltipText="Configure the API in the settings">
                      <span className="text-secondary" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Enable?
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            if (verifierId === 'Sourcify' && !sourcifySupported) {
              return (
                <div key={verifierId} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{verifierId}</span>{' '}
                    <CustomTooltip tooltipText={`The configured Sourcify server (${chainSettings.verifiers['Sourcify'].apiUrl}) does not support chain ${selectedChain?.chainId}`}>
                      <span className="text-secondary w-auto" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Unsupported
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            return (
              <div key={verifierId} className="pt-4">
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
                    <div className="pt-2">
                      Status:{' '}
                      <span className="font-weight-bold" style={{ textTransform: 'capitalize' }}>
                        {lookupResults[verifierId].status}
                      </span>{' '}
                      {!!lookupResults[verifierId].lookupUrl && <a href={lookupResults[verifierId].lookupUrl} target="_blank" className="fa fas fa-arrow-up-right-from-square"></a>}
                    </div>
                    {!!lookupResults[verifierId].sourceFiles && lookupResults[verifierId].sourceFiles.length > 0 && (
                      <div className="pt-2 d-flex flex-row justify-content-center">
                        <button className="btn btn-secondary bg-transparent text-body" onClick={() => handleOpenInRemix(lookupResults[verifierId])}>
                          <i className="fas fa-download"></i> Open in Remix
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        }
      </div>
    </>
  )
}
