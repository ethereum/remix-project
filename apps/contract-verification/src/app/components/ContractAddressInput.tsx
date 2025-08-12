import React, { useEffect, useState, useContext } from 'react'
import { isAddress } from 'ethers'

interface ContractAddressInputProps {
  label: string | any
  id: string
  contractAddress: string
  setContractAddress: (address: string) => void
  contractAddressError: string | any
  setContractAddressError: (error: string) => void
}

// Chooses one contract from the compilation output.
export const ContractAddressInput: React.FC<ContractAddressInputProps> = ({ label, id, contractAddress, setContractAddress, contractAddressError, setContractAddressError }) => {
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isValidAddress = isAddress(event.target.value)
    setContractAddress(event.target.value)
    if (!isValidAddress) {
      setContractAddressError('Invalid contract address')
      console.error('Invalid contract address')
      return
    }
    setContractAddressError('')
  }

  return (
    <div className="mb-3">
      <label htmlFor={id}>{label}</label>
      {contractAddressError && <div className="text-danger">{contractAddressError}</div>}
      <input type="text" className="form-control" id={id} placeholder="0x2738d13E81e..." value={contractAddress} onChange={handleAddressChange} />
    </div>
  )
}
