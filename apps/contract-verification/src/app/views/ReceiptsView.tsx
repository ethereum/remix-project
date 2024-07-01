import React from 'react'
import { AppContext } from '../AppContext'
import example from './example.js'
import { AccordionReceipt } from '../components/AccordionReceipt'
import { SubmittedContract } from '../types/VerificationTypes'

export const ReceiptsView = () => {
  const { chains } = React.useContext(AppContext)
  // const {submittedContracts} = React.useContext(AppContext);

  const getChainName = (chainId: string) => {
    return chains.find((chain) => chain.chainId === parseInt(chainId))?.name ?? 'Unknown Chain'
  }

  const submittedContracts = example as unknown as Record<string,SubmittedContract>
  console.log('submittedContracts', submittedContracts)
  return (
    <div className="accordion" id="receiptsAccordion">
      {Object.values(submittedContracts).map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} chainName={getChainName(contract.chainId)} />
      ))}
      {Object.values(submittedContracts).map((contract, index) => (
        <AccordionReceipt contract={contract} index={index+1} chainName={getChainName(contract.chainId)} />
      ))}
    </div>
  )
}
