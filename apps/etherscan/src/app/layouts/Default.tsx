import React, {PropsWithChildren} from 'react'

import {HeaderWithSettings} from '../components'

interface Props {
  from: string
  title?: string
  children: any
}

export const DefaultLayout = ({children, from, title}: Props) => {
  return (
    <div>
      <HeaderWithSettings from={from} title={title} />
      {children}
    </div>
  )
}
