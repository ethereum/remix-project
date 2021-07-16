import React, { useState } from 'react'
import { PluginManagerComponent } from '../../types'

interface ButtonProps {
  buttonText: 'Activate' | 'Deactivate'
  pluginName: string
  pluginComponent: PluginManagerComponent
}

function Button ({
  buttonText,
  pluginName,
  pluginComponent
}: ButtonProps) {
  const dataId = `pluginManagerComponentDeactivateButton${pluginName}`
  const [needToDeactivate] = useState('btn btn-secondary btn-sm')
  const [needToActivate] = useState('btn btn-success btn-sm')
  return (
    <button
      onClick={buttonText === 'Activate' ? () => {
        pluginComponent.activateP(pluginName)
        buttonText = 'Deactivate'
      } : () => {
        pluginComponent.deactivateP(pluginName)
        buttonText = 'Activate'
      }}
      className={buttonText === 'Activate' ? needToActivate : needToDeactivate}
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default Button
