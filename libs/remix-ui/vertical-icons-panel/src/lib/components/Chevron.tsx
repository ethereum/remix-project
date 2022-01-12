/* eslint-disable no-use-before-define */
import React, { MutableRefObject } from 'react'

export interface ChevronProps {
    divElementRef: MutableRefObject<any>
    cssRule: string,
    direction: string
}

function Chevron (props: ChevronProps) {
  const click = () => {
    if (props.direction === 'down') {
      props.divElementRef.current.scrollBy(0, 40)
    } else {
      props.divElementRef.current.scrollBy(0, -40)
    }
  }

  return (
    <>
      { props.divElementRef.current && props.divElementRef.current.scrollHeight > props.divElementRef.current.clientHeight
        ? <i onClick={click} className={props.cssRule}></i> : null }
    </>
  )
}

export { Chevron }
