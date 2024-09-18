import { useContext } from 'react'
import { AccordionReceipt } from '../components/AccordionReceipt'
import { AppContext } from '../AppContext'

export const ReceiptsView = () => {
  const { submittedContracts } = useContext(AppContext)
  const contracts = Object.values(submittedContracts).reverse()

  return (
    <div>
      {contracts.length > 0 ? contracts.map((contract, index) => (
        <AccordionReceipt contract={contract} index={index} />
      )) : <div className="text-center mt-5">No contracts submitted for verification</div>}
    </div>
  )
}
