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
    >
      {children}
      <i className={toggleAccordion ? 'far fa-angle-right' : 'far fa-angle-down'}></i>
    </div>
  )
}
