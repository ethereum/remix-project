import React, { useMemo } from 'react'
import { SubmittedContract } from '../types'
import { shortenAddress, CustomTooltip } from '@remix-ui/helper'
import { AppContext } from '../AppContext'

interface AccordionReceiptProps {
  contract: SubmittedContract
  index: number
}

export const AccordionReceipt: React.FC<AccordionReceiptProps> = ({ contract, index }) => {
  const { chains } = React.useContext(AppContext)

  const [expanded, setExpanded] = React.useState(false)

  const chainName = useMemo(() => {
    return chains.find((chain) => chain.chainId === parseInt(contract.chainId))?.name ?? 'Unknown Chain'
  }, [contract, chains])

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
            on {chainName} {contract.proxyAddress ? 'with proxy' : ''}
          </span>
        </button>
      </h3>
      <div id={`collapse${index}`} className={`accordion-collapse p-2 collapse ${expanded ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent="#receiptsAccordion">
        <div className="accordion-body">
          {!contract.proxyAddress ? (
            <ReceiptsBody contract={contract}></ReceiptsBody>
          ) : (
            <>
              <div>
                <span className="font-weight-bold" style={{ fontSize: '1.2rem' }}>
                  Implementation
                </span>
                <ReceiptsBody contract={contract}></ReceiptsBody>
              </div>
              <div className="mt-3">
                <span className="font-weight-bold" style={{ fontSize: '1.2rem' }}>
                  Proxy
                </span>{' '}
                <CustomTooltip tooltipText={contract.proxyAddress}>
                  <span>{shortenAddress(contract.proxyAddress)}</span>
                </CustomTooltip>
                {/* TODO add body for proxies */}
                {/* <ReceiptsBody contract={contract.proxy}></ReceiptsBody> */}
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
        {new Date(contract.date).toLocaleString()}
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
              {/*TODO add link*/}
            </tr>
          </thead>
          <tbody>
            {contract.receipts.map((receipt) => (
              <tr key={`${contract.id}-${receipt.verifierInfo.name}`}>
                <td>{receipt.verifierInfo.name}</td>
                <td>{receipt.verifierInfo.apiUrl}</td>
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
