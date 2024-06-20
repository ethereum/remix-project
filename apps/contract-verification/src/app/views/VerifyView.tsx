import React, {useEffect, useState} from 'react'

import {AppContext} from '../AppContext'
import {SearchableDropdown} from '../components'
import {ContractDropdown} from '../components/ContractDropdown'
import {ethers} from 'ethers/'
import {Chain, SubmittedContract, VerificationReceipt} from '../types/VerificationTypes'
import {SourcifyVerifier} from '../Verifiers/SourcifyVerifier'
import {EtherscanVerifier} from '../Verifiers/EtherscanVerifier'
import {useNavigate} from 'react-router-dom'
import {ConstructorArguments} from '../components/ConstructorArguments'

export const VerifyView = () => {
  const {chains, compilationOutput, verifiers, setVerifiers, selectedContractFileAndName, setSubmittedContracts} = React.useContext(AppContext)
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Selected chain changed', selectedChain)
  }, [selectedChain])

  const ethereumChainIds = [1, 3, 4, 5, 11155111, 17000]

  // Add Ethereum chains to the head of the chains list. Sort the rest alphabetically
  const dropdownChains = chains.sort((a, b) => {
    const isAInEthereum = ethereumChainIds.includes(a.chainId)
    const isBInEthereum = ethereumChainIds.includes(b.chainId)

    if (isAInEthereum && !isBInEthereum) return -1
    if (!isAInEthereum && isBInEthereum) return 1
    if (isAInEthereum && isBInEthereum) return ethereumChainIds.indexOf(a.chainId) - ethereumChainIds.indexOf(b.chainId)

    return (a.title || a.name).localeCompare(b.title || b.name)
  })

  const handleVerify = async (e) => {
    e.preventDefault() // Don't change the page

    const [triggerFilePath, filePath, contractName] = selectedContractFileAndName.split(':')
    const enabledVerifiers = verifiers.filter((verifier) => verifier.enabled)
    const compilerAbstract = compilationOutput[triggerFilePath]
    if (!compilerAbstract) {
      throw new Error(`Error: Compilation output not found for ${selectedContractFileAndName}`)
    }

    const date = new Date()
    // A receipt for each verifier
    const receipts: VerificationReceipt[] = enabledVerifiers.map((verifier) => ({verifier, status: null, receiptId: null, message: null}))
    const newSubmittedContract: SubmittedContract = {
      id: selectedChain?.chainId + '-' + contractAddress + '-' + date.toString(),
      address: contractAddress,
      chainId: selectedChain?.chainId.toString(),
      filePath,
      contractName,
      compilerAbstract,
      date,
      receipts,
    }
    setSubmittedContracts((prev) => ({...prev, [newSubmittedContract.id]: newSubmittedContract}))

    console.log('newSubmittedContract:', newSubmittedContract)

    // Take user to receipt view
    navigate('/receipts')

    // Verify for each verifier. forEach does not wait for await and each promise will execute in parallel
    receipts.forEach(async (receipt) => {
      const {verifier} = receipt
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
          const response = await verifier.verify(selectedChain?.chainId.toString(), contractAddress, compilerAbstract, selectedContractFileAndName)
          receipt.status = 'perfect'
        } catch (e) {
          const err = e as Error
          receipt.status = 'error'
          receipt.message = err.message
        }
      }

      // Update the UI
      setSubmittedContracts((prev) => ({...prev, [newSubmittedContract.id]: newSubmittedContract}))
    })
  }

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isValidAddress = ethers.utils.isAddress(event.target.value)
    setContractAddress(event.target.value)
    if (!isValidAddress) {
      setContractAddressError('Invalid contract address')
      console.error('Invalid contract address')
      return
    }
    setContractAddressError('')
  }

  console.log('sourcifyVerifiers:', verifiers)

  return (
    <div className="my-4">
      <div>
        <h2 className="text-center text-uppercase font-weight-bold">Verify</h2>
        <p className="text-center" style={{fontSize: '0.8rem'}}>
          Verify compiled contracts on different verification services
        </p>
      </div>
      <form onSubmit={handleVerify}>
        <SearchableDropdown label="Contract Chain" chains={dropdownChains} id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

        <div className="form-group">
          <label htmlFor="contract-address">Contract Address</label>
          <div>{contractAddressError && <div className="text-danger">{contractAddressError}</div>}</div>
          <input type="text" className="form-control" id="contract-address" placeholder="0x2738d13E81e..." value={contractAddress} onChange={handleAddressChange} />
        </div>

        <ContractDropdown label="Contract Name" id="contract-dropdown-1" />

        <button type="submit" className="btn btn-primary">
          {' '}
          Verify{' '}
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
          <ConstructorArguments />
        </div>
      </form>
    </div>
  )
}
