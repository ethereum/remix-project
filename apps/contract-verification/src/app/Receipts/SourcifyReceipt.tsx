import React, { useState, useEffect } from 'react'
import { SourcifyVerifier } from '../Verifiers/SourcifyVerifier'
// import { SourcifyVerificationStatus } from '../types'
import { ReceiptProps } from './props'

// A receipt is something to be rendered
export const SourcifyReceipt: React.FC<ReceiptProps> = ({ verifyPromise, address, chainId, verifier }) => {
  const [status, setStatus] = useState< null>(null)
  const [submissionDate] = useState(new Date()) // This will be set once and not change

  useEffect(() => {
    // You might want to handle the promise here or perform other side effects
    verifyPromise
      .then(() => {
        // Handle promise resolution
        // Update status based on the result
      })
      .catch(() => {
        // Handle promise rejection
      })

    // This effect should only run once on mount, hence the empty dependency array
  }, [verifyPromise])

  return (
    <div>
      <h1>Verification Receipt</h1>
      <p>Address: {address}</p>
      <p>Chain ID: {chainId}</p>
      <p>Submission Date: {submissionDate.toLocaleString()}</p>
      <p>Status: {status ? status : 'Pending'}</p>
    </div>
  )
}

export default SourcifyReceipt
