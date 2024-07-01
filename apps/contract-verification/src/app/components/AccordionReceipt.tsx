import React from 'react'
import { SubmittedContract } from '../types/VerificationTypes'
import { shortenAddress, CustomTooltip } from '@remix-ui/helper'

interface AccordionReceiptProps {
  contract: SubmittedContract
  chainName: string
  index: number
}

export const AccordionReceipt: React.FC<AccordionReceiptProps> = ({ contract, index, chainName }) => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleAccordion = () => {
    setExpanded(!expanded)
  }

  return (
    <div key={contract.address + '-' + index} className="bg-secondary p-3 accordion-item" id={contract.address + '-accordion-' + index}>
      <h3 className="accordion-header" id={`heading${index}`}>
        <button className="accordion-button d-flex flex-row align-items-center text-left w-100 border-0" type="button" onClick={toggleAccordion} aria-expanded={expanded} aria-controls={`collapse${index}`}>
          <span className={`accordion-arrow ${expanded ? 'fa-angle-down' : 'fa-angle-right'} fa w-0`} style={{ width: '0' }}></span>
          <span className="pl-4" style={{ fontSize: '1rem' }}>
            <CustomTooltip tooltipText={contract.address}>
              <span>{shortenAddress(contract.address)}</span>
            </CustomTooltip>{' '}
            on {chainName}
          </span>
        </button>
      </h3>
      <div id={`collapse${index}`} className={`accordion-collapse p-2 collapse ${expanded ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent="#receiptsAccordion">
        <div className="accordion-body">
          <div>
            <span className="font-weight-bold">Chain ID: </span>
            {contract.chainId}
          </div>
          <div>
            <span className="font-weight-bold">File: </span>
            {contract.filePath}
          </div>
          <div>
            <span className="font-weight-bold">Contract: </span>
            {contract.contractName}
          </div>
          <div>
            <span className="font-weight-bold">Submission: </span>
            {contract.date.toLocaleString()}
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Verifier</th>
                  <th>API URL</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>ReceiptID</th>
                </tr>
              </thead>
              <tbody>
                {contract.receipts.map((receipt) => (
                  <tr key={receipt.receiptId}>
                    <td>{receipt.verifier.name}</td>
                    <td>{receipt.verifier.apiUrl}</td>
                    <td>{receipt.status}</td>
                    <td>{receipt.message}</td>
                    <td>{receipt.receiptId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
