import React, { useState } from 'react'
import { PluginManagerComponent } from '../../types'

interface ActivateButtonProps {
  buttonText: string
  pluginName: string
  pluginComponent: PluginManagerComponent
}

function ActivateButton ({
  buttonText,
  pluginName,
  pluginComponent
}: ActivateButtonProps) {
  const [dataId] = useState(`pluginManagerComponent${buttonText}Button${pluginName}`)

  return (
    <button
      onClick={() => {
        pluginComponent.activateP(pluginName)
      }}
      className={buttonText === 'Activate' ? 'btn btn-success btn-sm' : 'btn btn-secondary btn-sm'}
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default ActivateButton
