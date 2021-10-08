/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode } from 'react'

interface OtherIconsProps {
  children: ReactNode
}

function OtherIcons ({ children }: OtherIconsProps) {
  return (
    <div id="otherIcons">{ children }</div>
  )
}

export default OtherIcons
