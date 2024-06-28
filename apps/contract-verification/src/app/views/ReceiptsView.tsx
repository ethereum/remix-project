import React from 'react'
import { AppContext } from '../AppContext'
import example from './example.js'
import { AccordionReceipt } from '../components/AccordionReceipt'
import { SubmittedContract } from '../types/VerificationTypes'

export const ReceiptsView = () => {
  // const {submittedContracts} = React.useContext(AppContext);

  const submittedContracts = example as unknown as Record<string,SubmittedContract>
  console.log('submittedContracts', submittedContracts)
  return (
    <>
      {Object.values(submittedContracts).map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} />
      ))}
    </>
  )
}
