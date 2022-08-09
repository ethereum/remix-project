import React, { PropsWithChildren } from "react"

import { HeaderWithSettings } from "../components"

interface Props {
  from: string
}

export const DefaultLayout: React.FC<PropsWithChildren<Props>> = ({
  children,
  from,
}) => {
  return (
    <div>
      <HeaderWithSettings from={from} />
      {children}
    </div>
  )
}
