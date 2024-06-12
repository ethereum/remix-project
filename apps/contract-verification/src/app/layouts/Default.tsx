import React, {PropsWithChildren} from 'react'

import {NavMenu} from '../components/NavMenu'

interface Props {
  from: string
  title?: string
}

export const DefaultLayout = ({children, from, title}) => {
  return (
    <div>
      <NavMenu />
      {children}
    </div>
  )
}
