import React, { useState } from 'react'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle'

export type CustomAccordionToggleProps = {
  children: React.ReactNode
  eventKey: string
  callback?: any
}

export default function CustomAccordionToggle({ children, eventKey }: CustomAccordionToggleProps) {
  const [toggleAccordion, setToggleAccordion] = useState(false)

  const decoratedOnClick = useAccordionToggle(eventKey, () =>
    setToggleAccordion(!toggleAccordion)
  )

  return (
    <div
      onClick={decoratedOnClick}
      className="d-flex flex-row justify-content-between align-items-center mx-3"
    >
      {children}
      <i className={toggleAccordion ? 'far fa-angle-down' : 'far fa-angle-right'}></i>
    </div>
  )
}
