import React from 'react'
import {AppContext} from '../AppContext'

export const ReceiptsView = () => {
  const {submittedContracts} = React.useContext(AppContext)

  return (
    <div className="my-4">
      {Object.values(submittedContracts).map((contract) => (
        <div key={contract.address}>
          <div>Contract Address: {contract.address}</div>
          <div>Chain ID: {contract.chainId}</div>
          <div>
            filePath: {contract.filePath} contractName: {contract.contractName}
          </div>
          <div>Submission Date: {contract.date.toLocaleString()}</div>
          <div>
            Receipts:{' '}
            <ul>
              {contract.receipts.map((receipt) => (
                <li key={`${contract.address}-${receipt.verifier.name}`}>
                  <ul>
                    <li>Verifier: {receipt.verifier.name}</li>
                    <li>API URL: {receipt.verifier.apiUrl}</li>
                    <li>Status: {receipt.status}</li>
                    <li>Receipt ID: {receipt.receiptId}</li>
                    <li>Message: {receipt.message}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
