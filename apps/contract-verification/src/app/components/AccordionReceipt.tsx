import React from 'react'
import {SubmittedContract} from '../types/VerificationTypes'

interface AccordionReceiptProps {
  contract: SubmittedContract
  index: number
}

export const AccordionReceipt: React.FC<AccordionReceiptProps> = ({contract, index}) => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleAccordion = () => {
    setExpanded(!expanded)
  }

  return (
    <div key={contract.address + '-' + index} className={`bg-secondary accordion p-3 ${expanded ? 'open' : ''}`} id={contract.address + '-accordion-' + index}>
      <div className="accordion-item">
        <h3 className="d-flex flex-row" id={`heading${index}`}>
          <button className={`accordion-button text-left`} type="button" onClick={toggleAccordion} aria-expanded={expanded} aria-controls={`collapse${index}`}>
            {'>'}
          </button>
          <div>
            {contract.address} on {contract.chainId} (Add chain name)
          </div>
        </h3>
        <div id={`collapse${index}`} className={`accordion-collapse p-2 collapse ${expanded ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <div>Chain ID: {contract.chainId}</div>
            <div>
              filePath: {contract.filePath} contractName: {contract.contractName}
            </div>
            <div>Submission Date: {contract.date.toLocaleString()}</div>
            <div>
              Receipts:
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Verifier</th>
                      <th>API Url</th>
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
      </div>
    </div>
  )
}
