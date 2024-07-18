import example from './example.js'
import { AccordionReceipt } from '../components/AccordionReceipt'
import type { SubmittedContracts } from '../types'

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
