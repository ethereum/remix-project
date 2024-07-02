import React, { useEffect, useState, useContext } from 'react'
import { ethers } from 'ethers/'

interface ContractAddressInputProps {
  label: string
  id: string
  setContractAddress: (address: string) => void
  contractAddress: string
}

// Chooses one contract from the compilation output.
export const ContractAddressInput: React.FC<ContractAddressInputProps> = ({ label, id, setContractAddress, contractAddress }) => {
  const [contractAddressError, setContractAddressError] = useState('')

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

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div>{contractAddressError && <div className="text-danger">{contractAddressError}</div>}</div>
      <input type="text" className="form-control" id={id} placeholder="0x2738d13E81e..." value={contractAddress} onChange={handleAddressChange} />
    </div>
  )
}
