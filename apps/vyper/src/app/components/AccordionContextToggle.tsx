import React, { useContext } from 'react'
import { AccordionContext } from 'react-bootstrap'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle'

function ContextAwareToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext)

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <button
      type="button"
      style={{ backgroundColor: isCurrentEventKey ? 'fas fa-angle-right' : 'fas fa-angle-down' }}
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
}
