import React, { useContext, useState } from 'react'
import { AccordionContext } from 'react-bootstrap'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle'

export type CustomAccordionToggleProps = {
  children: React.ReactNode
  eventKey: string
  callback?: any
}

export default function CustomAccordionToggle({ children, eventKey }: CustomAccordionToggleProps) {
  const [toggleAccordion, setToggleAccordion] = useState(false)
  // <i className={toggleAccordion ? 'fas fa-angle-right' : 'fas fa-angle-down'}></i>

  const decoratedOnClick = useAccordionToggle(eventKey, () =>
    setToggleAccordion(!toggleAccordion)
  )


  return (
    <div
      onClick={decoratedOnClick}
    >
      {children}
    </div>
  )
}
