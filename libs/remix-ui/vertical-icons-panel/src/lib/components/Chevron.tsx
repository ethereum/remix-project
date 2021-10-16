/* eslint-disable no-use-before-define */
import React, { MutableRefObject } from 'react'

export interface ChevronProps {
    divElementRef: MutableRefObject<any>
    cssRule: string
}

function Chevron (props: ChevronProps) {
  return (
    <>
      { props.divElementRef.current && props.divElementRef.current.scrollHeight > props.divElementRef.current.clientHeight
        ? <i className={props.cssRule}></i> : null }
    </>
  )
}

export { Chevron }
