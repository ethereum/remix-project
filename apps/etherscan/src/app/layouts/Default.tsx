import React, { PropsWithChildren } from "react"

import { HeaderWithSettings } from "../components"

interface Props {
  from: string
  title?: string
}

export const DefaultLayout: React.FC<PropsWithChildren<Props>> = ({
  children,
  from,
  title
}) => {
  return (
    <div>
      <HeaderWithSettings from={from} title={title} />
      {children}
    </div>
  )
}
