import React, { useEffect, useState } from 'react'
import { gitPluginContext } from '../gitui'
export const Version = () => {
  const context = React.useContext(gitPluginContext)
  return (
    <div>
      <p>{context.version.includes('version') ? context.version : `Git version: ${context.version}` }</p>
    </div>
  )
}