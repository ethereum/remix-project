/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

interface IconKindProps {
  idName: string
  dataIdName?: string
}

function IconKind ({ idName, dataIdName }: IconKindProps) {
  return (
    <div id={idName} data-id={dataIdName}>
    </div>
  )
}

export default IconKind
