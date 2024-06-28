import React, { PropsWithChildren } from 'react'

import { NavMenu } from '../components/NavMenu'

interface Props {
  from: string
  title?: string
  description?: string
}

export const DefaultLayout = ({ children, title, description }: PropsWithChildren<Props>) => {
  return (
    <div>
      <NavMenu />
      <div className="my-4">
        <div>
          <h2 className="text-center text-uppercase font-weight-bold">{title}</h2>
          <p className="text-center" style={{ fontSize: '0.8rem' }}>
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
