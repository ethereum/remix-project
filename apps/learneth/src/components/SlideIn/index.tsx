import React, {type ReactNode, useEffect, useState} from 'react'
import {CSSTransition} from 'react-transition-group'
import './index.css'

const SlideIn: React.FC<{children: ReactNode}> = ({children}) => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(true)
  }, [])

  return (
    <CSSTransition in={show} timeout={400} classNames="slide" unmountOnExit>
      {children}
    </CSSTransition>
  )
}

export default SlideIn
