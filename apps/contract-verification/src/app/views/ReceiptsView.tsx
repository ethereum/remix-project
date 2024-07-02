import example from './example.js'
import { AccordionReceipt } from '../components/AccordionReceipt'
import { SubmittedContracts } from '../types/VerificationTypes'

export const ReceiptsView = () => {
  const submittedContracts = example as unknown as SubmittedContracts
  // const {submittedContracts} = React.useContext(AppContext);

  return (
    <div className="accordion" id="receiptsAccordion">
      {Object.values(submittedContracts).map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} />
      ))}
    </div>
  )
}
