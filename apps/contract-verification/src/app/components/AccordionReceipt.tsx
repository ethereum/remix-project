import React, { useMemo } from 'react'
import { SubmittedContract, SubmittedProxyContract, isContract, isProxy } from '../types/VerificationTypes'
import { shortenAddress, CustomTooltip } from '@remix-ui/helper'
import { AppContext } from '../AppContext'

interface AccordionReceiptProps {
  contract: SubmittedContract | SubmittedProxyContract
  index: number
}

export const AccordionReceipt: React.FC<AccordionReceiptProps> = ({ contract, index }) => {
  const { chains } = React.useContext(AppContext)

  const [expanded, setExpanded] = React.useState(false)

  const address = isProxy(contract) ? contract.implementation.address : contract.address

  const chainName = useMemo(() => {
    const chainId = isProxy(contract) ? contract.implementation.chainId : contract.chainId
    return chains.find((chain) => chain.chainId === parseInt(chainId))?.name ?? 'Unknown Chain'
  }, [contract, chains])

  const toggleAccordion = () => {
    setExpanded(!expanded)
  }

  return (
    <div key={address + '-' + index} className="bg-secondary p-3 accordion-item" id={address + '-accordion-' + index}>
      <h3 className="accordion-header" id={`heading${index}`}>
        <button className="accordion-button d-flex flex-row align-items-center text-left w-100 border-0" type="button" onClick={toggleAccordion} aria-expanded={expanded} aria-controls={`collapse${index}`}>
          <span className={`accordion-arrow ${expanded ? 'fa-angle-down' : 'fa-angle-right'} fa w-0`} style={{ width: '0' }}></span>
          <span className="pl-4" style={{ fontSize: '1rem' }}>
            <CustomTooltip tooltipText={address}>
              <span>{shortenAddress(address)}</span>
            </CustomTooltip>
            &nbsp;on {chainName} {isProxy(contract) ? 'with proxy' : ''}
          </span>
        </button>
      </h3>
      <div id={`collapse${index}`} className={`accordion-collapse p-2 collapse ${expanded ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent="#receiptsAccordion">
        <div className="accordion-body">
          {isContract(contract) ? (
            <ReceiptsBody contract={contract}></ReceiptsBody>
          ) : (
            <>
              <div>
                <span className="font-weight-bold" style={{ fontSize: '1.2rem' }}>
                  Implementation
                </span>
                <ReceiptsBody contract={contract.implementation}></ReceiptsBody>
              </div>
              <div className="mt-3">
                <span className="font-weight-bold" style={{ fontSize: '1.2rem' }}>
                  Proxy
                </span>
                &nbsp;
                <CustomTooltip tooltipText={contract.proxy.address}>
                  <span>{shortenAddress(contract.proxy.address)}</span>
                </CustomTooltip>
                <ReceiptsBody contract={contract.proxy}></ReceiptsBody>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ReceiptsBody = ({ contract }: { contract: SubmittedContract }) => {
  return (
    <>
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
    </>
  )
}
