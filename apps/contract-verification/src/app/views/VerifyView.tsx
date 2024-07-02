import React, { useEffect, useState } from 'react'

import { AppContext } from '../AppContext'
import { SearchableChainDropdown, ContractDropdown, ContractAddressInput } from '../components'
import { Chain, SubmittedContract, VerificationReceipt } from '../types/VerificationTypes'
import { SourcifyVerifier } from '../Verifiers/SourcifyVerifier'
import { EtherscanVerifier } from '../Verifiers/EtherscanVerifier'
import { useNavigate } from 'react-router-dom'
import { ConstructorArguments } from '../components/ConstructorArguments'

export const VerifyView = () => {
  const { compilationOutput, verifiers, setVerifiers, selectedContractFileAndName, setSubmittedContracts } = React.useContext(AppContext)
  const [contractAddress, setContractAddress] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [abiEncodedConstructorArgs, setAbiEncodedConstructorArgs] = React.useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Selected chain changed', selectedChain)
  }, [selectedChain])

  const handleVerify = async (e) => {
    e.preventDefault() // Don't change the page

    console.log('selectedContractFileAndName', selectedContractFileAndName)
    const [triggerFilePath, filePath, contractName] = selectedContractFileAndName.split(':')
    const enabledVerifiers = verifiers.filter((verifier) => verifier.enabled)
    const compilerAbstract = compilationOutput[triggerFilePath]
    if (!compilerAbstract) {
      throw new Error(`Error: Compilation output not found for ${selectedContractFileAndName}`)
    }

    const date = new Date()
    // A receipt for each verifier
    const receipts: VerificationReceipt[] = enabledVerifiers.map((verifier) => ({ verifier, status: null, receiptId: null, message: null }))
    const newSubmittedContract: SubmittedContract = {
      type: 'contract',
      id: selectedChain?.chainId + '-' + contractAddress + '-' + date.toString(),
      address: contractAddress,
      chainId: selectedChain?.chainId.toString(),
      filePath,
      contractName,
      compilerAbstract,
      date,
      receipts,
    }
    setSubmittedContracts((prev) => ({ ...prev, [newSubmittedContract.id]: newSubmittedContract }))

    console.log('newSubmittedContract:', newSubmittedContract)

    // Take user to receipt view
    navigate('/receipts')

    // Verify for each verifier. forEach does not wait for await and each promise will execute in parallel
    receipts.forEach(async (receipt) => {
      const { verifier } = receipt
      if (verifier instanceof SourcifyVerifier) {
        try {
          const response = await verifier.verify(selectedChain?.chainId.toString(), contractAddress, compilerAbstract, selectedContractFileAndName)
          receipt.status = response.result[0].status
        } catch (e) {
          const err = e as Error
          receipt.status = 'error'
          receipt.message = err.message
        }
      } else if (verifier instanceof EtherscanVerifier) {
        try {
          const response = await verifier.verify(selectedChain?.chainId.toString(), contractAddress, compilerAbstract, selectedContractFileAndName, abiEncodedConstructorArgs)
          receipt.status = 'perfect'
        } catch (e) {
          const err = e as Error
          receipt.status = 'error'
          receipt.message = err.message
        }
      }

      // Update the UI
      setSubmittedContracts((prev) => ({ ...prev, [newSubmittedContract.id]: newSubmittedContract }))
    })
  }

  console.log('sourcifyVerifiers:', verifiers)

  return (
    <form onSubmit={handleVerify}>
      <SearchableChainDropdown label="Chain" id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

      <ContractAddressInput label="Contract Address" id="contract-address" setContractAddress={setContractAddress} contractAddress={contractAddress} />

      <ContractDropdown label="Contract Name" id="contract-dropdown-1" />

      <button type="submit" className="btn btn-primary">
        Verify
      </button>

      <div>
        {verifiers?.length > 0 &&
          verifiers.map((verifier) => (
            <div key={verifier.name} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`verifier-${verifier.name}`}
                checked={verifier.enabled}
                onChange={(e) => {
                  verifier.enabled = e.target.checked
                  // Trigger a re-render
                  setVerifiers([...verifiers])
                }}
              />
              <label className="form-check-label" htmlFor={`verifier-${verifier.name}`}>
                {verifier.name} ({verifier.apiUrl})
              </label>
            </div>
          ))}
      </div>
      <div>
        <ConstructorArguments abiEncodedConstructorArgs={abiEncodedConstructorArgs} setAbiEncodedConstructorArgs={setAbiEncodedConstructorArgs} />
      </div>
    </form>
  )
}
