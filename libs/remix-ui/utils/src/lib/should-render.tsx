import React from 'react'

/* eslint-disable-next-line */
export interface ShouldRenderProps {
  children?: React.ReactNode,
  if: boolean
}

export const ShouldRender = (props: ShouldRenderProps) => {
  return props.if ? (
    props.children
  ) : null
}

export default ShouldRender
