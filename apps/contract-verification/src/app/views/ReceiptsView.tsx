import React from 'react'
import {AppContext} from '../AppContext'
import example from './example.js'
import {AccordionReceipt} from '../components/AccordionReceipt'
import {SubmittedContract} from '../types/VerificationTypes'

export const ReceiptsView = () => {
  // const {submittedContracts} = React.useContext(AppContext);

  const submittedContracts = example as unknown as SubmittedContract
  console.log('submittedContracts', submittedContracts)
  return (
    <div className="my-4">
      {Object.values(submittedContracts).map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} />
      ))}
    </div>
  )
}
