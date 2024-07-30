import { useContext, useEffect, useState } from 'react'

import { AppContext } from '../AppContext'
import { SearchableChainDropdown, ContractDropdown, ContractAddressInput } from '../components'
import type { VerifierIdentifier, Chain, SubmittedContract, VerificationReceipt, VerifierInfo } from '../types'
import { VERIFIERS } from '../types'
import { mergeChainSettingsWithDefaults, validConfiguration } from '../utils'
import { useNavigate } from 'react-router-dom'
import { ConstructorArguments } from '../components/ConstructorArguments'
import { ContractDropdownSelection } from '../components/ContractDropdown'
import { CustomTooltip } from '@remix-ui/helper'
import { getVerifier } from '../Verifiers'

export const VerifyView = () => {
  const { compilationOutput, setSubmittedContracts, settings } = useContext(AppContext)
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [abiEncodedConstructorArgs, setAbiEncodedConstructorArgs] = useState<string>('')
  const [abiEncodingError, setAbiEncodingError] = useState<string>('')
  const [selectedContract, setSelectedContract] = useState<ContractDropdownSelection | undefined>()
  const [enabledVerifiers, setEnabledVerifiers] = useState<Partial<Record<VerifierIdentifier, boolean>>>({})
  const [hasProxy, setHasProxy] = useState(false)
  const [proxyAddress, setProxyAddress] = useState('')
  const [proxyAddressError, setProxyAddressError] = useState('')
  const navigate = useNavigate()

  const chainSettings = selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined

  const submitDisabled = !!contractAddressError || !contractAddress || !selectedChain || !selectedContract || (hasProxy && !!proxyAddressError) || (hasProxy && !proxyAddress)

  // Enable all verifiers with valid configuration
  useEffect(() => {
    const changedEnabledVerifiers = {}
    for (const verifierId of VERIFIERS) {
      if (validConfiguration(chainSettings, verifierId)) {
        changedEnabledVerifiers[verifierId] = true
      }
    }
    setEnabledVerifiers(changedEnabledVerifiers)
  }, [selectedChain])

  const handleVerifierCheckboxClick = (verifierId: VerifierIdentifier, checked: boolean) => {
    setEnabledVerifiers({ ...enabledVerifiers, [verifierId]: checked })
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    const { triggerFilePath, filePath, contractName } = selectedContract
    const compilerAbstract = compilationOutput[triggerFilePath]
    if (!compilerAbstract) {
      throw new Error(`Error: Compilation output not found for ${triggerFilePath}`)
    }

    const date = new Date()
    const contractId = selectedChain?.chainId + '-' + contractAddress + '-' + date.toUTCString()
    const receipts: VerificationReceipt[] = []
    for (const [verifierId, enabled] of Object.entries(enabledVerifiers)) {
      if (!enabled) {
        continue
      }

      const verifierInfo: VerifierInfo = {
        apiUrl: chainSettings.verifiers[verifierId].apiUrl,
        name: verifierId as VerifierIdentifier,
      }
      receipts.push({ verifierInfo, status: 'pending', contractId, isProxyReceipt: false })
    }

    const newSubmittedContract: SubmittedContract = {
      id: contractId,
      address: contractAddress,
      chainId: selectedChain?.chainId.toString(),
      filePath,
      contractName,
      date: date.toUTCString(),
      receipts,
    }
    if (abiEncodedConstructorArgs) {
      newSubmittedContract.abiEncodedConstructorArgs = abiEncodedConstructorArgs
    }
    setSubmittedContracts((prev) => ({ ...prev, [newSubmittedContract.id]: newSubmittedContract }))

    // Take user to receipt view
    navigate('/receipts')

    // Verify for each verifier. forEach does not wait for await and each promise will execute in parallel
    receipts.forEach(async (receipt) => {
      const { verifierInfo } = receipt
      const verifierSettings = chainSettings.verifiers[verifierInfo.name]
      const verifier = getVerifier(verifierInfo.name, { ...verifierSettings })
      try {
        const { status, message, receiptId } = await verifier.verify(newSubmittedContract, compilerAbstract)
        receipt.status = status
        receipt.message = message
        if (receiptId) {
          receipt.receiptId = receiptId
        }
      } catch (e) {
        const err = e as Error
        receipt.status = 'failed'
        receipt.message = err.message
      }

      // Update the UI
      setSubmittedContracts((prev) => ({ ...prev, [newSubmittedContract.id]: newSubmittedContract }))
    })
  }

  return (
    <form onSubmit={handleVerify}>
      <SearchableChainDropdown label="Chain" id="network-dropdown" selectedChain={selectedChain} setSelectedChain={setSelectedChain} />

      <ContractAddressInput label="Contract Address" id="contract-address" contractAddress={contractAddress} setContractAddress={setContractAddress} contractAddressError={contractAddressError} setContractAddressError={setContractAddressError} />

      <ContractDropdown label="Contract Name" id="contract-dropdown-1" setSelectedContract={setSelectedContract} />

      {selectedContract && <ConstructorArguments abiEncodedConstructorArgs={abiEncodedConstructorArgs} setAbiEncodedConstructorArgs={setAbiEncodedConstructorArgs} selectedContract={selectedContract} abiEncodingError={abiEncodingError} setAbiEncodingError={setAbiEncodingError} />}

      <div className="pt-3 form-check form-switch">
        <input className="form-check-input" type="checkbox" id="has-proxy" checked={!!hasProxy} onChange={(e) => setHasProxy(e.target.checked)} />
        <label className="form-check-label" htmlFor="has-proxy">
          The deployed contract is behind a proxy
        </label>
        {hasProxy && <ContractAddressInput label="Proxy Address" id="proxy-address" contractAddress={proxyAddress} setContractAddress={setProxyAddress} contractAddressError={proxyAddressError} setContractAddressError={setProxyAddressError} />}
      </div>

      <div className="pt-3">
        Verify on:
        {VERIFIERS.map((verifierId) => {
          return (
            <div key={verifierId} className="pt-2 form-check">
              <input className="form-check-input" type="checkbox" id={`verifier-${verifierId}`} checked={!!enabledVerifiers[verifierId]} onChange={(e) => handleVerifierCheckboxClick(verifierId, e.target.checked)} disabled={!chainSettings || !validConfiguration(chainSettings, verifierId)} />

              <div className="d-flex flex-column align-items-start">
                <label htmlFor={`verifier-${verifierId}`} style={{ fontSize: '1rem', lineHeight: '1.5', color: 'var(--text)' }} className={`mb-0 font-weight-bold${!chainSettings || validConfiguration(chainSettings, verifierId) ? '' : ' text-secondary'}`}>
                  {verifierId}
                </label>
                {!chainSettings ? (
                  ''
                ) : validConfiguration(chainSettings, verifierId) ? (
                  <span className="text-secondary">{chainSettings.verifiers[verifierId].apiUrl}</span>
                ) : (
                  <CustomTooltip tooltipText="Configure the API in the settings">
                    <span className="text-secondary w-auto" style={{ textDecoration: 'underline dotted' }}>
                      Enable?
                    </span>
                  </CustomTooltip>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button type="submit" className="btn btn-primary mt-3" disabled={submitDisabled}>
        Verify
      </button>
    </form>
  )
}
