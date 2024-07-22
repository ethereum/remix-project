import { useContext } from 'react'
import { AccordionReceipt } from '../components/AccordionReceipt'
import { AppContext } from '../AppContext'

export const ReceiptsView = () => {
  const { submittedContracts } = useContext(AppContext)

  return (
    <div className="accordion" id="receiptsAccordion">
      {Object.values(submittedContracts).reverse().map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} />
      ))}
    </div>
  )
}
